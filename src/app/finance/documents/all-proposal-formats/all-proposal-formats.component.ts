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
import { SolarProposalModel } from '../../documents/document.model';
import { LoginModel } from '../../../auth/login-model';
import { DocumentService } from '../document.service';
import { ProductService } from '../../products/product.service';
import { UtilsService } from '../../../shared/services/utils.service';
import { BrandModel, ProductCategoryModel, StateModel } from '../../../shared/common.models';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { DocumentPdfService } from '../document-pdf.service';
import { CompanyModel } from '../../../company-settings/company.model';
import { CompanyService } from '../../../company-settings/company.service';
import { ProductModel } from '../../products/product.model';

@Component({
  selector: 'app-all-proposal-formats',
  templateUrl: './all-proposal-formats.component.html',
  styleUrls: ['./all-proposal-formats.component.sass']
})
export class AllProposalFormatsComponent implements OnInit {

  displayedColumns = [
    'serialNo',
    'customerName',
    'amount',
    'proposalDate',

    'solarModelId',
    'capacity',
    'inverterModelId',
    'inverterCapacity',
    'actions'
  ];
  dataSource: ExampleDataSource | null;
  dataChange: BehaviorSubject<SolarProposalModel[]> = new BehaviorSubject<SolarProposalModel[]>([]);
  apiURL: string = environment.apiUrl;
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  currency = settings.CURRENCY;
  session: SessionModel;
  login: LoginModel;
  productMap: Map<number, string> = new Map<number, string>();
  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();
  company: CompanyModel;
  productsMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  productCategoryModelMap: Map<number, ProductCategoryModel> = new Map<number, ProductCategoryModel>();
  stateMap: Map<number, StateModel> = new Map<number, StateModel>();

  constructor(
    private dialog: MatDialog,
    private documentService: DocumentService,
    private notification: NotificationsService,
    private localStorageData: LocalStorageData,
    private productService: ProductService,
    private utilsService: UtilsService,
    private pdfService: PdfService,
    private documentPdfService: DocumentPdfService,
    private companyService: CompanyService,

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

    this.utilsService.getBrandDetails().subscribe(data => {
      data.forEach(brand => {
        this.brandMap.set(brand.id, brand);
      });

      this.companyService.getCompanyDetails(this.login.companyId).pipe(first()).subscribe(companyModel => {
        if (companyModel == undefined) {
          companyModel = new CompanyModel({});
        }
        this.company = companyModel;
      });

      this.productService.getAllProducts(this.login.companyId).subscribe(data => {
        data.forEach(product => {
          this.productMap.set(product.id, this.brandMap.get(product.brandId)?.name + '-' + product.modelNo);
          this.productsMap.set(product.id, product);
        });
      });

    });

    this.utilsService.getAllProductCategory().subscribe(data => {
      data.forEach(product => {
        this.productCategoryModelMap.set(product.id, product);
      });
    });
    this.utilsService.getStates(1).subscribe(data => data.forEach(state => this.stateMap.set(state.id, state)));

    this.loadData();
  }

  addNew() {
    this.router.navigate(['billing/finance/documents/add-proposal-format']);
  }

  editCall(row) {
    this.router.navigateByUrl('billing/finance/documents/add-proposal-format', { state: { solarProposalModel: row, action: 'edit' } });
  }

  viewStaffProfile(solarProposalModel: SolarProposalModel, action = 'open') {
    const proposalData = this.documentPdfService.getProposalData(solarProposalModel, this.brandMap, this.productsMap, this.productCategoryModelMap, this.company, this.stateMap);
    this.pdfService.generateProposalPDF(this.company, proposalData, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', action);
  }

  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: '',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.documentService.deleteSolarProposal(id).subscribe(() => {
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
    this.dataChange = new BehaviorSubject<SolarProposalModel[]>([]);

    this.documentService.getAllSolarProposals(this.login.companyId).subscribe(data => {
      this.dataChange.next(data);
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
export class ExampleDataSource extends DataSource<SolarProposalModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: SolarProposalModel[] = [];
  renderedData: SolarProposalModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<SolarProposalModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): SolarProposalModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<SolarProposalModel[]> {
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
          .filter((staffLoansModel: SolarProposalModel) => {
            const searchStr = (
              staffLoansModel.customerName +
              staffLoansModel.proposalDate +
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
  sortData(data: SolarProposalModel[]): SolarProposalModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'staffLoansDate':
          [propertyA, propertyB] = [a.proposalDate, b.proposalDate];
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
