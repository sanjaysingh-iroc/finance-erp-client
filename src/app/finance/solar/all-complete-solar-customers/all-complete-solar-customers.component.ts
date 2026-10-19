import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { settings } from '../../../demo/data';
import { NotificationsService } from '../../../shared/notifications-service';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { DeleteDialogComponent } from '../../../shared/dialog/delete/delete.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';
import { LoginModel } from '../../../auth/login-model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { BrandModel, ProductBrandModel } from '../../../shared/common.models';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductService } from '../../products/product.service';
import { SolarCustomerModel } from '../solar-billing.model';
import { SolarService } from '../solar.service';

@Component({
  selector: 'app-all-complete-solar-customers',
  templateUrl: './all-complete-solar-customers.component.html',
  styleUrls: ['./all-complete-solar-customers.component.sass']
})
export class AllCompleteSolarCustomersComponent implements OnInit {
  displayedColumns = [
    'name',
    'address',
    'mobile',
    'email',
    'bankDetails',
    'details',
    'application',
    'price',
    'actions'
  ];

  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<SolarCustomerModel>(true, []);
  solarCustomerModel: SolarCustomerModel | null;
  dataChange: BehaviorSubject<SolarCustomerModel[]> = new BehaviorSubject<SolarCustomerModel[]>([]);
  showDateFormat: string;
  apiURL: string = environment.apiUrl;

  allSolarCustomerModels: SolarCustomerModel[];
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();
  staffMapChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  login: LoginModel;

  productMap: Map<number, string> = new Map<number, string>();

  constructor(
    private dialog: MatDialog,
    private solarBillingService: SolarService,
    private notification: NotificationsService,
    private staffService: StaffService,
    private localStorageData: LocalStorageData,
    private utilsService: UtilsService,
    private productService: ProductService,
    private router: Router,

  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  ngOnInit() {
    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.login = this.localStorageData.userValue;
    this.staffMapChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
    const staffNameMap: Map<number, string> = new Map<number, string>();

    this.utilsService.getBrandDetails().subscribe(data => {
      const brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();
      data.forEach(brand => {
        brandMap.set(brand.id, brand);
      });

      this.productService.getAllProducts(this.login.companyId).subscribe(data => {
        data.forEach(product => {
          if (product.productType == 10 || product.productType == 11 || product.productType == 12) {
            this.productMap.set(product.id, brandMap.get(product.brandId)?.name + '-' + product.modelNo);
          }
        });
      });
    });

    this.staffService.getAllUsers(this.login.companyId).subscribe(data => {
      data.forEach(staffModel => {
        this.staffMap.set(staffModel.id, staffModel);
        staffNameMap.set(staffModel.id, staffModel.name);
      });
      this.staffMapChange.next(staffNameMap);
    });
    this.loadData();
  }

  formatWithRegex(num: string): string {
    return num.replace(/\B(?=(\d{4})+(?!\d))/g, "-");
  }

  get data(): SolarCustomerModel[] {
    return this.dataChange.value;
  }

  updateCustomerUrl(event) {
    event.target.src = "assets/images/blank_image.png";
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }
  
  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: row.name,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.solarBillingService.deleteSolarCustomer(id).subscribe(() => {
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

  public loadData() {
    this.dataChange = new BehaviorSubject<SolarCustomerModel[]>([]);
    this.solarBillingService.getAllActiveSolarCustomers(this.login.companyId, true).subscribe(data => {
      data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      this.dataChange.next(data);
      this.allSolarCustomerModels = data;
      console.log(this.allSolarCustomerModels);
    });

    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort,
      this.staffMapChange,
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
export class ExampleDataSource extends DataSource<SolarCustomerModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: SolarCustomerModel[] = [];
  renderedData: SolarCustomerModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<SolarCustomerModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort,
    public dataChange1: BehaviorSubject<Map<number, string>>,
  ) {
    super();
    // Reset to the first page when the customer changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): SolarCustomerModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<SolarCustomerModel[]> {
    const displayDataChanges = [
      this.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        const staffMap: Map<number, string> = this.dataChange1.value;
        this.filteredData = this.data
          .slice()
          .filter((customer: SolarCustomerModel) => {
            const searchStr = (
              customer.name +
              customer.mobile
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
  sortData(data: SolarCustomerModel[]): SolarCustomerModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'name':
          [propertyA, propertyB] = [a.name.toLowerCase(), b.name.toLowerCase()];
          break;
        case 'mobile':
          [propertyA, propertyB] = [a.mobile, b.mobile];
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