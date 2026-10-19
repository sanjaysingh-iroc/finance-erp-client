import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VendorService } from '../vendor.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { VendorModel } from '../vendor.model';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { settings } from '../../../demo/data';
import { NotificationsService } from '../../../shared/notifications-service';
import { ExcelExportService } from '../../../shared/excelExport/excelExport-service';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { UtilsService } from '../../../shared/services/utils.service';
import { LoginModel } from '../../../auth/login-model';
import { LocalStorageData } from '../../../shared/local-storage-data';
@Component({
  selector: 'app-all-vendors',
  templateUrl: './all-vendors.component.html',
  styleUrls: ['./all-vendors.component.sass']
})
export class AllVendorComponent implements OnInit {
  displayedColumns = [
    'firmName',
    'contactPersonName',
    'mobile',
    'email',
    'emergencyMobile',
    'actions'
  ];

  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<VendorModel>(true, []);
  vendor: VendorModel | null;
  dataChange: BehaviorSubject<VendorModel[]> = new BehaviorSubject<VendorModel[]>([]);
  showDateFormat: string;
  vendorTypeMap: Map<number, string> = new Map<number, string>();
  apiURL: string = environment.apiUrl;
  login: LoginModel;

  constructor(
    private vendorService: VendorService,
    private utilsService: UtilsService,
    private notification: NotificationsService,
    private pdfService: PdfService,
    private excelExportService: ExcelExportService,
    private localStorageData: LocalStorageData,
    private router: Router
  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  ngOnInit() {
    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.loadData();
  }

  updateVendorUrl(event, row) {
    event.target.src = "assets/images/user/avatar.png";
  }
  refresh() {
    this.loadData();
  }

  viewVendorProfile(vendor) {
    this.router.navigateByUrl('billing/finance/vendors/about-vendor', { state: { vendor: vendor, action: 'view' } });
  }

  get data(): VendorModel[] {
    return this.dataChange.value;
  }

  addNew() {
    this.router.navigate(['billing/finance/vendors/add-vendor']);
  }

  editCall(row) {
    this.router.navigateByUrl('billing/finance/vendors/add-vendor', { state: { vendorModel: row, action: 'edit' } });
  }

  updateVendor(vendor, id) {
    this.vendorService.addNewVendor(vendor).subscribe(
      (data) => {
        const foundIndex = this.dataChange.value.findIndex(
          (x) => x.id == id
        );

        this.dataChange.value[
          foundIndex
        ] = data;
        this.refreshTable();
        this.notification.showNotification(
          'black',
          'Edit Record Successfully...!!!',
          'bottom',
          'center'
        );
      }
    );
  }


  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }
  isAllSelected() {

    let numSelected = this.selection.selected.length;
    const numRows = this.dataSource.renderedData.length;
    this.dataSource.renderedData.forEach((row) => {
      if (!row.active) {
        numSelected++;
      }
    });
    return numSelected == numRows;
  }

  masterToggle(event) {

    if (event.checked) {
      this.dataSource.renderedData.forEach((row) => {
        if (row.active) {
          this.selection.select(row);
        }
      });
    } else {
      this.selection.clear();
    }
  }

  public loadData() {

    this.login = this.localStorageData.userValue;
    this.dataChange = new BehaviorSubject<VendorModel[]>([]);
    this.vendorService.getAllVendors(this.login.companyId).subscribe(
      data => {
        data.sort((a, b) => a.contactPersonName.localeCompare(b.contactPersonName));
        this.dataChange.next(data);
      }
    );
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
export class ExampleDataSource extends DataSource<VendorModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: VendorModel[] = [];
  renderedData: VendorModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<VendorModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the vendor changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): VendorModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<VendorModel[]> {
    const displayDataChanges = [
      this.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data
          .slice()
          .filter((vendor: VendorModel) => {
            const searchStr = (
              vendor.firmName +
              vendor.contactPersonName +
              vendor.mobile
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
  sortData(data: VendorModel[]): VendorModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'firmName':
          [propertyA, propertyB] = [a.firmName.toLowerCase(), b.firmName.toLowerCase()];
          break;
        case 'contactPersonName':
          [propertyA, propertyB] = [a.contactPersonName.toLowerCase(), b.contactPersonName.toLowerCase()];
          break;
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