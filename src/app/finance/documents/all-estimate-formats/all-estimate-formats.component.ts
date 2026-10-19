import { DataSource } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { NotificationsService } from '../../../shared/notifications-service';
import { DeleteDialogComponent } from '../../../shared/dialog/delete/delete.component';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { settings } from '../../../demo/data';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { SessionModel } from '../../../session/session.model';
import { SolarEstimateModel } from '../../documents/document.model';
import { CompanyService } from '../../../company-settings/company.service';
import { CompanyModel } from '../../../company-settings/company.model';
import { LoginModel } from '../../../auth/login-model';
import { DocumentService } from '../document.service';
import { DocumentPdfService } from '../document-pdf.service';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { BrandModel, StateModel } from '../../../shared/common.models';
import { ProductModel } from '../../products/product.model';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductService } from '../../products/product.service';

@Component({
  selector: 'app-all-estimate-formats',
  templateUrl: './all-estimate-formats.component.html',
  styleUrls: ['./all-estimate-formats.component.sass']
})
export class AllEstimateFormatsComponent implements OnInit {

  displayedColumns = [
    'serialNo',
    'customerName',
    'estimateDate',
    'amount',
    'actions'
  ];
  dataSource: ExampleDataSource | null;
  dataChange: BehaviorSubject<SolarEstimateModel[]> = new BehaviorSubject<SolarEstimateModel[]>([]);
  apiURL: string = environment.apiUrl;
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  currency = settings.CURRENCY;
  session: SessionModel;
  // companyMap: Map<number, CompanyModel> = new Map<number, CompanyModel>();
  amountWithGSTMap: Map<number, number> = new Map<number, number>();

  login: LoginModel;

  constructor(
    private dialog: MatDialog,
    private documentService: DocumentService,
    private notification: NotificationsService,
    private localStorageData: LocalStorageData,
    private companyService: CompanyService,
    private documentPdfService: DocumentPdfService,
    private pdfService: PdfService,
    private utilsService: UtilsService,
    private productService: ProductService,
    private router: Router
  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  ngOnInit() {
    this.session = this.localStorageData.sessionValue;
    this.login = this.localStorageData.userValue;
    this.companyService.getCompanyDetails(this.login.companyId).pipe(first()).subscribe(companyModel => {
      if (companyModel == undefined) {
        companyModel = new CompanyModel({});
      }
      this.companyModel = companyModel;
    });
    this.utilsService.getStates(1).subscribe(data => data.forEach(state => this.stateMap.set(state.id, state)));

    this.utilsService.getBrandDetails().subscribe(data => {
      data.forEach(brand => {
        this.brandMap.set(brand.id, brand);
      });

      this.productService.getAllProducts(this.login.companyId).subscribe(data => {
        data.forEach(product => {
          if (product.productType == 10) {
            this.productsMap.set(product.id, product);
          } else if (product.productType == 11 || product.productType == 12) {
            this.productsMap.set(product.id, product);
          } else if (product.productType == 18) {
            this.installationProduct = product;
          }
        });
      });

    });
    this.loadData();
  }

  addNew() {
    this.router.navigate(['billing/finance/documents/add-estimate-format']);
  }

  editCall(row) {
    this.router.navigateByUrl('billing/finance/documents/add-estimate-format', { state: { solarEstimateModel: row, action: 'edit' } });
  }
  companyModel: CompanyModel;
  stateMap: Map<number, StateModel> = new Map<number, StateModel>();
  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();
  productsMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  installationProduct: ProductModel;

  viewStaffProfile(solarEstimateModel) {
    const header = this.documentPdfService.createEstimateHeader(this.companyModel, this.stateMap);
    this.pdfService.generateEstimatePDF(this.companyModel, this.documentPdfService.getEstimatePDFData(solarEstimateModel, this.companyModel, this.productsMap, this.brandMap, this.installationProduct), header, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', 'open');
  }

  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: '',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.documentService.deleteSolarEstimate(id).subscribe(() => {
          const foundIndex = this.dataChange.value.findIndex(
            (x) => x.id == id
          );
          this.dataChange.value.splice(foundIndex, 1);
          this.refreshTable();
          this.notification.showDangerNotification(
            'Delete Record Successfully...!!!',
            'bottom'
          );
        },
          (error: HttpErrorResponse) => {
            this.notification.showDangerNotification(
              'Record can not be deleted...!!!',
              'bottom'
            );
          });
      }
    });
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  public loadData() {
    this.dataChange = new BehaviorSubject<SolarEstimateModel[]>([]);

    this.documentService.getAllSolarEstimates(this.login.companyId).subscribe(data => {
      this.dataChange.next(data);

      data.forEach(solarEstimateModel => {
        const amount: number = solarEstimateModel.amount;
        this.amountWithGSTMap.set(solarEstimateModel.id, parseFloat((amount + ((amount * solarEstimateModel.gst) / 100)).toFixed(2)));
      });
    });
    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort
    );
    fromEvent(this.filter.nativeElement, 'keyup')
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

}
export class ExampleDataSource extends DataSource<SolarEstimateModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: SolarEstimateModel[] = [];
  renderedData: SolarEstimateModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<SolarEstimateModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): SolarEstimateModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<SolarEstimateModel[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page,
    ];
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.data
          .slice()
          .filter((staffLoansModel: SolarEstimateModel) => {
            const searchStr = (
              staffLoansModel.customerName +
              staffLoansModel.estimateDate +
              staffLoansModel.amount
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());
        // Grab the page's slice of the filtered sorted data.
        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this._paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }
  disconnect() { }
  /** Returns a sorted copy of the database data. */
  sortData(data: SolarEstimateModel[]): SolarEstimateModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'staffLoansDate':
          [propertyA, propertyB] = [a.estimateDate, b.estimateDate];
          break;
        case 'amount':
          [propertyA, propertyB] = [a.amount, b.amount];
          break;
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1)
      );
    });
  }

}
