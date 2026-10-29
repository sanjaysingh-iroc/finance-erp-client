import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CustomerService } from '../customer.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CustomerLoanModel, CustomerModel } from '../customer.model';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { settings } from '../../demo/data';
import { NotificationsService } from '../../shared/notifications-service';
import { Router } from '@angular/router';
import { LocalStorageData } from '../../shared/local-storage-data';
import { DeleteDialogComponent } from '../../shared/dialog/delete/delete.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { LoginModel } from '../../auth/login-model';
import { Utils } from '../../shared/util-class';
import { AssociateService } from '../../associate/associate.service';
import { AssociateModel } from '../../associate/associate.model';
@Component({
  selector: 'app-all-customer-loans',
  templateUrl: './all-customer-loans.component.html',
  styleUrls: ['./all-customer-loans.component.sass']
})
export class AllCustomerLoanComponent implements OnInit {
  displayedColumns = [
    'id',
    'customerId',
    'associate',
    'customerLoanDate',
    'amount',
    'paidAmount',
    'totalPendingAmount',


    'actions'
  ];

  dataSource: ExampleDataSource | null;
  dataChange: BehaviorSubject<CustomerLoanModel[]> = new BehaviorSubject<CustomerLoanModel[]>([]);
  showDateFormat: string;
  customerModelMap: Map<number, CustomerModel> = new Map<number, CustomerModel>();
  invoiceModelMap: Map<number, string> = new Map<number, string>();
  loanTotalPaidAmountMap: Map<number, number> = new Map<number, number>();
  login: LoginModel;
  customerMapChange: BehaviorSubject<Map<number, CustomerModel>> = new BehaviorSubject<Map<number, CustomerModel>>(new Map<number, CustomerModel>());
  invoiceMapChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  customerLoanAmountMap: Map<number, string> = new Map<number, string>();
  customerLoanAmountMapChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  currentDate: Date = new Date();
  dayCalculate: Map<number, number> = new Map<number, number>();

  associateMap: Map<number, AssociateModel> = new Map<number, AssociateModel>();


  constructor(
    private dialog: MatDialog,
    private utils: Utils,
    private customerService: CustomerService,
    private notification: NotificationsService,
    private router: Router,
    private localStorageData: LocalStorageData,
    private associateService: AssociateService,

  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  ngOnInit() {
    this.login = this.localStorageData.userValue;
    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.customerMapChange = new BehaviorSubject<Map<number, CustomerModel>>(new Map<number, CustomerModel>());
    this.invoiceMapChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
    this.customerLoanAmountMapChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());

    this.associateService.getAllActiveAssociates(this.login.companyId).subscribe(data => {
      data.forEach(customer => {
        this.associateMap.set(customer.id, customer);
      });
    });



    this.customerService.calculateAmountByLoanId(this.login.companyId).subscribe(data => {
      data.forEach(loanTotalPaidAmount => {
        this.loanTotalPaidAmountMap.set(loanTotalPaidAmount[0], loanTotalPaidAmount[1]);
      });
    });

    this.customerService.getCustomerLoanByLastDeposit(this.login.companyId).subscribe(data => {
      data.forEach(customerLoanAmountModel => {
        this.customerLoanAmountMap.set(customerLoanAmountModel.loanId, customerLoanAmountModel.depositDate);
      });
      this.customerLoanAmountMapChange.next(this.customerLoanAmountMap);
    });

    this.loadData();
  }

  approveCustomerLoan(row) {

    this.customerService.approveCustomerLoan(row.id, this.login.id).subscribe(data => {
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

  completeCustomerLoan(row) {
    this.customerService.completeCustomerLoan(row.id).subscribe(data => {
      this.loadData();
      this.notification.showSuccessNotification(
        'Loan has been Completed Successfully...!!!',
        'bottom'
      );
    }, error => {
      this.notification.showDangerNotification(
        'Loan has not been Completed Successfully...!!!',
        'bottom'
      );
    });
  }

  refresh() {
    this.loadData();
  }

  viewCustomerProfile(customer: CustomerLoanModel) {
    this.router.navigateByUrl('finance/customers/about-customer', { state: { customer:  this.customerModelMap.get(customer.customerId), action: 'view' } });
  }

  get data(): CustomerLoanModel[] {
    return this.dataChange.value;
  }

  addNew() {
    this.router.navigate(['finance/customers/add-customer-loan']);
  }

  editCall(row, customer) {
    this.router.navigateByUrl('finance/customers/add-customer-loan', { state: { customerLoanModel: row, customer: customer, action: 'edit' } });
  }

  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: row.name,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.customerService.deleteCustomerLoan(id).subscribe(() => {
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

  calculatePendingAmount(loanDate: string, amount: number) {
    const startDate = new Date(loanDate);
    const dayDifference = this.utils.calculateDaysDifference(startDate, this.currentDate);
    return amount * dayDifference;
  }

  calculateDays(loanDate: string) {
    const startDate = new Date(loanDate);
    const dayDifference = this.utils.calculateDaysDifference(startDate, this.currentDate);
    return dayDifference;
  }

  public loadData() {
    this.dataChange = new BehaviorSubject<CustomerLoanModel[]>([]);
    this.customerService.getAllCompleteCustomerLoans(this.login.companyId, false).subscribe(data => {
      this.dataChange.next(data);
      const customerList: number[] = [];
      data.forEach(customerModel => {
        customerList.push(customerModel.customerId);
        this.dayCalculate.set(customerModel.customerId, this.calculateDays(customerModel.loanDate));
      });
      if (customerList.length > 0) {
        this.customerService.getAllCustomersByIds(customerList).subscribe(data => {
          data.forEach(customerModel => {
            this.customerModelMap.set(customerModel.id, customerModel);
          });
        });
      }
    });
    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort,
      this.customerMapChange,
      this.invoiceMapChange,
      this.customerLoanAmountMapChange
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
export class ExampleDataSource extends DataSource<CustomerLoanModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: CustomerLoanModel[] = [];
  renderedData: CustomerLoanModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<CustomerLoanModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort,
    public dataChange1: BehaviorSubject<Map<number, CustomerModel>>,
    public dataChange2: BehaviorSubject<Map<number, string>>,
    public dataChange3: BehaviorSubject<Map<number, string>>,

  ) {
    super();
    // Reset to the first page when the customer changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): CustomerLoanModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<CustomerLoanModel[]> {
    const displayDataChanges = [
      this.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        const customerMapChange: Map<number, CustomerModel> = this.dataChange1.value;
        const invoiceMap: Map<number, string> = this.dataChange2.value;
        const customerLoanAmountMap: Map<number, string> = this.dataChange3.value;


        this.filteredData = this.data
          .slice()
          .filter((customer: CustomerLoanModel) => {
            const searchStr = (
              customer.comment.toLowerCase() +
              // invoiceMap.get(customer.invoiceId)?.toLowerCase() +
              customerMapChange.get(customer.customerId)?.name.toLowerCase()
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice(), customerMapChange, invoiceMap, customerLoanAmountMap);
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
  sortData(data: CustomerLoanModel[], customerMapChange: Map<number, CustomerModel>, invoiceMap: Map<number, string>, customerLoanAmountMap: Map<number, string>): CustomerLoanModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {


        case 'customerId':
          [propertyA, propertyB] = [customerMapChange.get(a.customerId)?.name.toLowerCase(), customerMapChange.get(b.customerId)?.name.toLowerCase()];
          break;
        case 'amount':
          [propertyA, propertyB] = [a.lendedAmount, b.lendedAmount];
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