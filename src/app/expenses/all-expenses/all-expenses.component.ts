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
import { ExpensesService } from '../../expenses/expenses.service';
import { DeleteDialogComponent } from '../../shared/dialog/delete/delete.component';
import { ExpensesModel } from '../expenses.model';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { settings } from '../../demo/data';
import { formatDate } from '@angular/common';
import { LocalStorageData } from '../../shared/local-storage-data';
import { SessionModel } from '../../session/session.model';
import { LoginModel } from '../../auth/login-model';

@Component({
  selector: 'app-all-expenses',
  templateUrl: './all-expenses.component.html',
  styleUrls: ['./all-expenses.component.sass']
})
export class AllExpensesComponent implements OnInit {

  displayedColumns = [
    'expenseTypeId',
    'otherInfo',
    'expensesDate',
    'amount',
    'billAttachment',
    'actions'
  ];
  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<ExpensesModel>(true, []);
  expensesModel: ExpensesModel | null;
  dataChange: BehaviorSubject<ExpensesModel[]> = new BehaviorSubject<ExpensesModel[]>([]);
  expenseTypeMap: Map<number, string> = new Map<number, string>();
  apiURL: string = environment.apiUrl;
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  currency = settings.CURRENCY;
  totalAmount = 0;
  session: SessionModel;
  login: LoginModel;
  constructor(
    private dialog: MatDialog,
    private expensesService: ExpensesService,
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
    this.session = this.localStorageData.sessionValue;
    this.login = this.localStorageData.userValue;
    this.expensesService.getAllExpenseTypes().subscribe(data => {

      data.forEach(expenseTyp => this.expenseTypeMap.set(expenseTyp.id, expenseTyp.expenseTypeName));
    });
    this.loadData();
  }

  addNew() {
    this.router.navigate(['finance/expenses/add-expenses']);
  }

  editCall(row) {
    this.router.navigateByUrl('finance/expenses/add-expenses', { state: { expensesModel: row, action: 'edit' } });
  }

  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: this.expenseTypeMap.get(row.expenseTypeId),
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.expensesService.deleteExpenses(id).subscribe(() => {
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
    this.dataChange = new BehaviorSubject<ExpensesModel[]>([]);

    this.totalAmount = 0;
    this.expensesService.getAllExpenses(this.login.companyId, this.session.id).subscribe(data => {
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
export class ExampleDataSource extends DataSource<ExpensesModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: ExpensesModel[] = [];
  renderedData: ExpensesModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<ExpensesModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): ExpensesModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ExpensesModel[]> {
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
          .filter((expensesModel: ExpensesModel) => {
            const searchStr = (
              expensesModel.expenseTypeId +
              expensesModel.otherInfo +
              expensesModel.expensesDate +
              expensesModel.amount
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
  sortData(data: ExpensesModel[]): ExpensesModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'expensesDate':
          [propertyA, propertyB] = [a.expensesDate, b.expensesDate];
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
