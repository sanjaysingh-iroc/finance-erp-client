import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NotificationsService } from '../../shared/notifications-service';
import { ExpensesService } from '../../expenses/expenses.service';
import { DeleteDialogComponent } from '../../shared/dialog/delete/delete.component';
import { ExpensesModel } from '../expenses.model';
import { environment } from '@environments/environment';
import { settings } from '../../demo/data';
import { LocalStorageData } from '../../shared/local-storage-data';
import { SessionModel } from '../../session/session.model';

@Component({
  selector: 'app-all-unApproveExpenses',
  templateUrl: './all-unApproveExpenses.component.html',
  styleUrls: ['./all-unApproveExpenses.component.sass']
})
export class AllUnapproveExpensesComponent implements OnInit {

  expenseTypeMap: Map<number, string> = new Map<number, string>();
  expensesModels: ExpensesModel[] = [];
  apiURL: string = environment.apiUrl;
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  currency = settings.CURRENCY;
  totalAmount = 0;
  session: SessionModel;

  constructor(
    private dialog: MatDialog,
    private expensesService: ExpensesService,
    private notification: NotificationsService,
    private localStorageData: LocalStorageData,
  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  ngOnInit() {
    this.session = this.localStorageData.sessionValue;

    this.expensesService.getAllExpenseTypes().subscribe(data => {
      data.forEach(expenseTyp => this.expenseTypeMap.set(expenseTyp.id, expenseTyp.expenseTypeName));
    });
    this.loadData();
  }

  approveExpense(row) {
    this.expensesService.approveExpenses(row.id)
      .subscribe(data => {
        this.loadData();
        this.notification.showSuccessNotification(
          'Expense has been Approved Successfully...!!!',
          'bottom'
        );
      }, error => {
        this.notification.showDangerNotification(
          'Expense has not been Approved Successfully...!!!',
          'bottom'
        );
      });
  }

  deleteItem(row: ExpensesModel) {
    const id = row.id.toString();
    const dialogRef = this.dialog.open(DeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {
        this.expensesService.deleteExpenses(id).subscribe(() => {
          this.loadData();
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
        // for delete we use splice in order to remove single object from DataService
      }
    });
  }

  public loadData() {
    this.totalAmount = 0;
    this.expensesService.getAllUnApproveExpenses(this.session.id).subscribe(data => {
      this.expensesModels = data;
      data.forEach(expenseModel => this.totalAmount += expenseModel.amount);
    });

  }
}