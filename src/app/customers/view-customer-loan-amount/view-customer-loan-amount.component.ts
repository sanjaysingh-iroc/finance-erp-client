import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CustomerService } from '../customer.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CustomerLoanAmountModel } from '../customer.model';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { settings } from '../../demo/data';
import { NotificationsService } from '../../shared/notifications-service';
import { Router } from '@angular/router';
import { LocalStorageData } from '../../shared/local-storage-data';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../shared/dialog/delete/delete.component';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginModel } from '../../auth/login-model';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';
import { formatDate } from '@angular/common';
import { ApproveDialogComponent } from '../../shared/dialog/approve/approve.component';

@Component({
  selector: 'app-view-customer-loan-amount',
  templateUrl: './view-customer-loan-amount.component.html',
  styleUrls: ['./view-customer-loan-amount.component.sass']
})
export class ViewCustomerLoanAmountComponent implements OnInit {
  displayedColumns = [
    'select',
    'name',
    'loanName',
    'DepositDate',
    'amount',
    'DepositedBy',
    'actions'
  ];

  dataSource: ExampleDataSource | null;
  dataChange: BehaviorSubject<CustomerLoanAmountModel[]> = new BehaviorSubject<CustomerLoanAmountModel[]>([]);
  showDateFormat: string;
  customerModelMap: Map<number, string> = new Map<number, string>();
  loanModelMap: Map<number, number> = new Map<number, number>();
  customerId = new FormControl('');
  allCustomerLoanAmountModels: CustomerLoanAmountModel[];
  login: LoginModel;
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();
  customerMapChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  loanMapChange: BehaviorSubject<Map<number, number>> = new BehaviorSubject<Map<number, number>>(new Map<number, number>());
  selection = new SelectionModel<CustomerLoanAmountModel>(true, []);

  constructor(
    private dialog: MatDialog,
    private staffService: StaffService,

    private customerService: CustomerService,
    private notification: NotificationsService,
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
    this.customerMapChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
    this.loanMapChange = new BehaviorSubject<Map<number, number>>(new Map<number, number>());

    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.login = this.localStorageData.userValue;
    this.staffService.getAllUsers(this.login.companyId).subscribe(data => {
      data.forEach(staffModel => this.staffMap.set(staffModel.id, staffModel));
    });

    this.customerService.getAllCompleteCustomerLoans(this.login.companyId, false).subscribe(data => {
      const customerList: number[] = [];
      data.forEach(loanModel => {
        customerList.push(loanModel.customerId);
        this.loanModelMap.set(loanModel.id, loanModel.id);

      });

      this.loanMapChange.next(this.loanModelMap);

      if (customerList.length > 0) {
        this.customerService.getAllCustomersByIds(customerList).subscribe(data => {
          data.forEach(customerModel => {
            this.customerModelMap.set(customerModel.id, customerModel.name);
          });
          this.customerMapChange.next(this.customerModelMap);

        });
      }


    });

    this.loadData();
  }

  approveCustomerLoanAmount(row) {
    this.customerService.approveCustomerLoanAmount(row.id, this.login.id).subscribe(data => {
      this.loadData();
      this.notification.showSuccessNotification(
        'Loan has been Approved Successfully...!!!',
        'bottom'
      );
    }, error => {
      this.notification.showDangerNotification(
        'Loan has not been Approved Successfully...!!!',
        'bottom'
      );
    });
  }

  refresh() {
    this.loadData();
  }

  get data(): CustomerLoanAmountModel[] {
    return this.dataChange.value;
  }

  addNew() {
    this.router.navigate(['finance/customers/add-customer-loan-amount']);
  }

  editCall(row) {
    this.router.navigateByUrl('finance/customers/add-customer-loan-amount', { state: { customerLoanAmountModel: row, action: 'edit' } });
  }

  isAllSelected() {
    let numSelected = this.selection.selected.length;
    const numRows = this.dataSource.renderedData.length;
    this.dataSource.renderedData.forEach((row) => {
      if (row.approved) {
        numSelected++;
      }
    });
    return numSelected == numRows;
  }

  masterToggle(event) {

    if (event.checked) {
      this.dataSource.renderedData.forEach((row) => {
        if (!row.approved) {
          this.selection.select(row);
        }

      });
    } else {
      this.selection.clear();
    }
  }

  approveSelectedRows() {
    const dialogRef = this.dialog.open(ApproveDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const ids = [];
        this.selection.selected.forEach((item) => {
          ids.push(item.id);
        });
        this.customerService.approveAllCustomerLoanAmount(ids.toString(), this.login.id).subscribe(() => {
          this.selection = new SelectionModel<CustomerLoanAmountModel>(true, []);
          this.loadData();
          this.notification.showSuccessNotification(
            ' All Selected Record Approved Successfully...!!!',
            'bottom'
          );
        });
      }
    });
  }

  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: row.name,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.customerService.deleteCustomerLoanAmount(id).subscribe(() => {
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

  updateCustomer(customer, id) {
    this.customerService.addNewCustomerLoanAmount(customer).subscribe(
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

  getCustomerBillings(event) {
    const customerId = event.value;
    let allCustomerLoanAmountModels: CustomerLoanAmountModel[] = [...this.allCustomerLoanAmountModels];

    if (customerId != 0) {
      allCustomerLoanAmountModels = allCustomerLoanAmountModels.filter(customerLoanAmountModel => customerLoanAmountModel.customerId == customerId);
    }

    this.dataChange.next(allCustomerLoanAmountModels);
    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort,
      this.customerMapChange,
      this.loanMapChange
    );
    fromEvent(this.filter.nativeElement, 'keyup')
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  public loadData() {
    this.dataChange = new BehaviorSubject<CustomerLoanAmountModel[]>([]);
    this.customerService.getAllCustomerLoanAmountDetails(this.login.companyId).subscribe(
      data => {
        this.allCustomerLoanAmountModels = data;
        this.dataChange.next(data);
      }
    );
    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort,
      this.customerMapChange,
      this.loanMapChange
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

export class ExampleDataSource extends DataSource<CustomerLoanAmountModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: CustomerLoanAmountModel[] = [];
  renderedData: CustomerLoanAmountModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<CustomerLoanAmountModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort,
    public dataChange1: BehaviorSubject<Map<number, string>>,
    public dataChange2: BehaviorSubject<Map<number, number>>,

  ) {
    super();
    // Reset to the first page when the customer changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): CustomerLoanAmountModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<CustomerLoanAmountModel[]> {
    const displayDataChanges = [
      this.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        const customerMapChange: Map<number, string> = this.dataChange1.value;
        const loanMapChange: Map<number, string> = this.dataChange1.value;

        this.filteredData = this.data
          .slice()
          .filter((customer: CustomerLoanAmountModel) => {
            const searchStr = (
              customer.loanId.toString() +
              customerMapChange.get(customer.customerId)?.toLowerCase() +
              loanMapChange.get(customer.loanId)?.toLowerCase()

            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice(), customerMapChange, loanMapChange);
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
  sortData(data: CustomerLoanAmountModel[], customerMapChange: Map<number, string>, loanMapChange: Map<number, string>): CustomerLoanAmountModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'name':
          [propertyA, propertyB] = [customerMapChange.get(a.customerId)?.toLowerCase(), customerMapChange.get(b.customerId)?.toLowerCase()];
          break;
        case 'loanName':
          [propertyA, propertyB] = [loanMapChange.get(a.loanId)?.toLowerCase(), loanMapChange.get(b.loanId)?.toLowerCase()];
          break;
        case 'DepositDate':
          [propertyA, propertyB] = [a.depositDate, b.depositDate];
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