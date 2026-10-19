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
import { ExcelExportService } from '../../../shared/excelExport/excelExport-service';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { DeleteDialogComponent } from '../../../shared/dialog/delete/delete.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CustomerLeadModel } from '../customer-lead.model';
import { CustomerLeadService } from '../customer-lead.service';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';
import { LoginModel } from '../../../auth/login-model';
import { LocalStorageData } from '../../../shared/local-storage-data';

@Component({
  selector: 'app-all-customers-lead',
  templateUrl: './all-customers-lead.component.html',
  styleUrls: ['./all-customers-lead.component.sass']
})
export class AllCustomerLeadComponent implements OnInit {
  displayedColumns = [
    'name',
    'mobile',
    'email',
    'activityAction',
    'activityDate',
    'nextActivityDate',
    'details',
    'assignTo',
    'generatedBy',
    'actions'
  ];

  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<CustomerLeadModel>(true, []);
  customerLeadModel: CustomerLeadModel | null;
  dataChange: BehaviorSubject<CustomerLeadModel[]> = new BehaviorSubject<CustomerLeadModel[]>([]);
  showDateFormat: string;
  apiURL: string = environment.apiUrl;

  nextActivityDate = new FormControl('');
  allCustomerLeadModels: CustomerLeadModel[];
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();
  staffMapChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  login: LoginModel;
  constructor(
    private dialog: MatDialog,
    private customerLeadService: CustomerLeadService,
    private notification: NotificationsService,
    private staffService: StaffService,
    private localStorageData: LocalStorageData,
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
    this.login = this.localStorageData.userValue;
    this.staffMapChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
    const staffNameMap: Map<number, string> = new Map<number, string>();

    this.staffService.getAllUsers(this.login.companyId).subscribe(data => {
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

  get data(): CustomerLeadModel[] {
    return this.dataChange.value;
  }

  addNew() {
    this.router.navigate(['billing/finance/customerLead/add-customer-lead']);
  }

  editCall(row) {
    this.router.navigateByUrl('billing/finance/customerLead/add-customer-lead', { state: { customerLeadModel: row, action: 'edit' } });
  }

  updateCustomer(customer, id) {
    this.customerLeadService.addNewCustomerLead(customer).subscribe(
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
    let allCustomerLeadModels: CustomerLeadModel[] = [...this.allCustomerLeadModels];
    if (nextActivityDate != null && nextActivityDate != '') {
      const nextActivityDateStr = formatDate(nextActivityDate, settings.SAVE_DATE_FORMAT, 'en');
      allCustomerLeadModels = allCustomerLeadModels.filter(customerLeadModel => customerLeadModel.nextActivityDate == nextActivityDateStr);
    }
    this.dataChange.next(allCustomerLeadModels);
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

    this.dataChange = new BehaviorSubject<CustomerLeadModel[]>([]);
    this.customerLeadService.getAllCustomerLeads(this.login.companyId).subscribe(data => {
      this.dataChange.next(data);
      this.allCustomerLeadModels = data;
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
export class ExampleDataSource extends DataSource<CustomerLeadModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: CustomerLeadModel[] = [];
  renderedData: CustomerLeadModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<CustomerLeadModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort,
    public dataChange1: BehaviorSubject<Map<number, string>>,
  ) {
    super();
    // Reset to the first page when the customer changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): CustomerLeadModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<CustomerLeadModel[]> {
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
          .filter((customer: CustomerLeadModel) => {
            const searchStr = (
              customer.name +
              customer.mobile +
              staffMap.get(customer.assignTo)
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
  sortData(data: CustomerLeadModel[]): CustomerLeadModel[] {
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