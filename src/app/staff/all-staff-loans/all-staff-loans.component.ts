import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExcelExportService } from '../../shared/excelExport/excelExport-service';
import { NotificationsService } from '../../shared/notifications-service';
import { PdfService } from '../../shared/pdfServices/pdfExport';
import { StaffService } from '../staff.service';
import { DeleteDialogComponent } from '../../shared/dialog/delete/delete.component';
import { StaffLoanModel, StaffModel } from '../staff.model';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { settings } from '../../demo/data';
import { formatDate } from '@angular/common';
import { LocalStorageData } from '../../shared/local-storage-data';
import { SessionModel } from '../../session/session.model';
import { LoginModel } from '../../auth/login-model';

@Component({
  selector: 'app-all-staff-loans',
  templateUrl: './all-staff-loans.component.html',
  styleUrls: ['./all-staff-loans.component.sass']
})
export class AllStaffLoanComponent implements OnInit {

  displayedColumns = [
    'staffId',
    'staffLoanDate',
    'amount',
    'comment',
    'actions'
  ];
  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<StaffLoanModel>(true, []);
  staffLoanModel: StaffLoanModel | null;
  dataChange: BehaviorSubject<StaffLoanModel[]> = new BehaviorSubject<StaffLoanModel[]>([]);
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();
  apiURL: string = environment.apiUrl;
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  currency = settings.CURRENCY;
  totalAmount = 0;
  session: SessionModel;
  login: LoginModel;

  constructor(
    private dialog: MatDialog,
    private staffService: StaffService,
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
    this.login = this.localStorageData.userValue;
    this.session = this.localStorageData.sessionValue;
    this.staffService.getAllUsers(this.login.companyId).subscribe(data => {
      data.forEach(staffModel => this.staffMap.set(staffModel.id, staffModel));
    });
    this.loadData();
  }


  addNew() {
    this.router.navigate(['finance/finance/staff/add-staff-loan']);
  }

  editCall(row) {
    this.router.navigateByUrl('finance/finance/staff/add-staff-loan', { state: { staffLoansModel: row, action: 'edit' } });
  }

  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: '',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.staffService.deleteStaffLoans(id).subscribe(() => {
          const foundIndex = this.dataChange.value.findIndex(
            (x) => x.id == id
          );
          this.totalAmount -= row.amount;
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
    this.dataChange = new BehaviorSubject<StaffLoanModel[]>([]);

    this.totalAmount = 0;


    this.staffService.getAllUnApproveLoans(this.login.companyId).subscribe(data => {
      this.dataChange.next(data);
      data.forEach(expenseModel => this.totalAmount += expenseModel.amount);
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
export class ExampleDataSource extends DataSource<StaffLoanModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: StaffLoanModel[] = [];
  renderedData: StaffLoanModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<StaffLoanModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): StaffLoanModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<StaffLoanModel[]> {
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
          .filter((staffLoansModel: StaffLoanModel) => {
            const searchStr = (
              staffLoansModel.staffId +
              staffLoansModel.staffLoanDate +
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
  sortData(data: StaffLoanModel[]): StaffLoanModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'staffLoansDate':
          [propertyA, propertyB] = [a.staffLoanDate, b.staffLoanDate];
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
