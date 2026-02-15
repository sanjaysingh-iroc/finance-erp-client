import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { settings } from '../../demo/data';
import { NotificationsService } from '../../shared/notifications-service';
import { ExcelExportService } from '../../shared/excelExport/excelExport-service';
import { PdfService } from '../../shared/pdfServices/pdfExport';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { DeleteDialogComponent } from '../../shared/dialog/delete/delete.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { SolarCustomerModel } from '../customer-lead.model';
import { CustomerLeadService } from '../customer-lead.service';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';

@Component({
  selector: 'app-all-solar-customers',
  templateUrl: './all-solar-customers.component.html',
  styleUrls: ['./all-solar-customers.component.sass']
})
export class AllSolarCustomersComponent implements OnInit {
  displayedColumns = [
    'name',
    'address',
    'mobile',
    'email',
    'bankDetails',
    'nextActivityDate',
    'details',
    'docAttachment',
    'actions'
  ];

  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<SolarCustomerModel>(true, []);
  solarCustomerModel: SolarCustomerModel | null;
  dataChange: BehaviorSubject<SolarCustomerModel[]> = new BehaviorSubject<SolarCustomerModel[]>([]);
  showDateFormat: string;
  apiURL: string = environment.apiUrl;

  nextActivityDate = new FormControl('');
  allSolarCustomerModels: SolarCustomerModel[];
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();
  staffMapChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());

  constructor(
    private dialog: MatDialog,
    private customerLeadService: CustomerLeadService,
    private notification: NotificationsService,
    private staffService: StaffService,

    private pdfService: PdfService,
    private excelExportService: ExcelExportService,
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

    this.staffMapChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
    const staffNameMap: Map<number, string> = new Map<number, string>();

    this.staffService.getAllUsers().subscribe(data => {
      data.forEach(staffModel => {
        this.staffMap.set(staffModel.id, staffModel);
        staffNameMap.set(staffModel.id, staffModel.name);


      });
      this.staffMapChange.next(staffNameMap);

    });
    this.loadData();
  }


  refresh() {
    this.loadData();
  }

  get data(): SolarCustomerModel[] {
    return this.dataChange.value;
  }

  generatePDF(action = 'open') {
    let data: string[][] = this.getData();
    this.pdfService.generatePDF('Customer Details', [], data, { alignment: 'center', margin: [80, 5, 0, 15] }, 'landscape', action, 1);

  }

  private getHeaderCaption() {
    return [
      { text: 'Sr. No.', style: 'tableHeader' },
      { text: 'Customer Name', style: 'tableHeader' },
      { text: 'DOB', style: 'tableHeader' },
      { text: 'Gender', style: 'tableHeader' },
      { text: 'Mobile', style: 'tableHeader' },
      { text: 'Joining Date', style: 'tableHeader' },
      { text: 'Password', style: 'tableHeader' },
      { text: 'Customer Type', style: 'tableHeader' }
    ];
  }
  exportExcel() {
    let s = this.getHeaderCaption();
    let columns = [];
    s.forEach(caption => {
      columns.push({ header: caption.text, key: caption.text, width: 20 });
    });

    let data = [];
    let index = 0;
    this.dataChange.value.map(customerModel => {
      let row = [];
      row.push((++index).toString());
      row.push(customerModel.name);
      row.push(customerModel.mobile);
      data.push(row);
    });

    this.excelExportService.exportExcel(columns, data, "Customer Details", "AllCustomer");
  }

  private getData() {
    let data = [];
    let index = 0;
    data.push(this.getHeaderCaption());
    this.dataChange.value.map(customerModel => {
      let row = [];
      row.push({ text: (++index).toString(), style: 'subheader' });
      row.push({ text: customerModel.name, style: 'subheader' });
      row.push({ text: customerModel.mobile, style: 'subheader' });
      data.push(row);
    });

    return data;
  }

  addNew() {
    this.router.navigate(['pages/customerLead/add-solar-customer']);
  }

  editCall(row) {
    this.router.navigateByUrl('pages/customerLead/add-solar-customer', { state: { solarCustomerModel: row, action: 'edit' } });
  }

  updateCustomer(customer, id) {
    this.customerLeadService.addNewSolarCustomer(customer).subscribe(
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

  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: row.name,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.customerLeadService.deleteCustomerLead(id).subscribe(() => {
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

  clearDate() {
    this.nextActivityDate.setValue(null);
    this.onDateChange();
  }

  onDateChange() {
    const nextActivityDate = this.nextActivityDate.value;
    let allSolarCustomerModels: SolarCustomerModel[] = [...this.allSolarCustomerModels];
    if (nextActivityDate != null && nextActivityDate != '') {
      const nextActivityDateStr = formatDate(nextActivityDate, settings.SAVE_DATE_FORMAT, 'en');
      allSolarCustomerModels = allSolarCustomerModels.filter(solarCustomerModel => solarCustomerModel.nextActivityDate == nextActivityDateStr);
    }
    this.dataChange.next(allSolarCustomerModels);
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


  public loadData() {

    this.dataChange = new BehaviorSubject<SolarCustomerModel[]>([]);
    this.customerLeadService.getAllSolarCustomers().subscribe(data => {
      this.dataChange.next(data);
      this.allSolarCustomerModels = data;
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