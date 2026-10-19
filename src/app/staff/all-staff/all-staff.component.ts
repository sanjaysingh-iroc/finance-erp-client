import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StaffService } from '../staff.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { StaffModel } from '../staff.model';
import { DataSource } from '@angular/cdk/collections';
import { DeleteDialogComponent } from './dialog/delete/delete.component';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { settings } from '../../demo/data';
import { SessionService } from '../../session/session.service';
import { NotificationsService } from '../../shared/notifications-service';
import { ExcelExportService } from '../../shared/excelExport/excelExport-service';
import { PdfService } from '../../shared/pdfServices/pdfExport';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { SessionModel } from '../../session/session.model';
import { LocalStorageData } from '../../shared/local-storage-data';
import { formatDate } from '@angular/common';
import { DeleteAllDialogComponent } from './dialog/delete-all/delete-all.component';
import { UtilsService } from '../../shared/services/utils.service';
import { LoginModel } from '../../auth/login-model';
@Component({
  selector: 'app-all-staff',
  templateUrl: './all-staff.component.html',
  styleUrls: ['./all-staff.component.sass']
})
export class AllstaffComponent implements OnInit {
  displayedColumns = [
    'select',
    'img',
    'name',
    'dob',
    'mobile',
    'doj',
    'password',
    'userType',
    'actions'
  ];

  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<StaffModel>(true, []);
  staff: StaffModel | null;
  dataChange: BehaviorSubject<StaffModel[]> = new BehaviorSubject<StaffModel[]>([]);
  showDateFormat: string;
  userTypeMap: Map<number, string> = new Map<number, string>();
  apiURL: string = environment.apiUrl;
  session: SessionModel;
  login: LoginModel;

  constructor(
    private dialog: MatDialog,
    private staffService: StaffService,
    private sessionService: SessionService,
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
    this.login = this.localStorageData.userValue;
    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.session = this.localStorageData.sessionValue;
    this.loadData();
  }

  updateStaffUrl(event, row) {
    event.target.src = "assets/images/user/avatar.png";
  }
  refresh() {
    this.loadData();
  }

  viewStaffProfile(staff) {
    this.router.navigateByUrl('finance/finance/staff/about-staff', { state: { staff: staff, action: 'view' } });
  }

  get data(): StaffModel[] {
    return this.dataChange.value;
  }

  addNew() {
    this.router.navigate(['finance/finance/staff/add-staff']);
  }

  editCall(row) {
    this.router.navigateByUrl('finance/finance/staff/add-staff', { state: { staffModel: row, action: 'edit' } });
  }

  updateStaff(staff, id) {
    this.staffService.addNewStaff(staff).subscribe(
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
      data: { staff: row, sessionYear: this.session.id, exitDate: formatDate(new Date(), settings.SAVE_DATE_FORMAT, 'en') }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.staffService.deleteStaff(id, formatDate(result.exitDate, settings.SAVE_DATE_FORMAT, 'en')).subscribe(() => {
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
      }
    });
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

  removeSelectedRows() {
    const dialogRef = this.dialog.open(DeleteAllDialogComponent, {
      data: { sessionYear: this.session.id, exitDate: formatDate(new Date(), settings.SAVE_DATE_FORMAT, 'en') }
    }
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const totalSelect = this.selection.selected.length;
        const ids = [];
        this.selection.selected.forEach((item) => {
          ids.push(item.id);
        });
        this.staffService.deleteStaff(ids.toString(), formatDate(result.exitDate, settings.SAVE_DATE_FORMAT, 'en')).subscribe(() => {
          this.selection = new SelectionModel<StaffModel>(true, []);
          this.loadData();
          this.notification.showDangerNotification(
            totalSelect + 'All Selected Record Delete Successfully...!!!',
            'bottom'
          );
        });
      }
    });
  }

  public loadData() {

    this.utilsService.getAllUserType()
      .subscribe(data => data.forEach(element => this.userTypeMap.set(element.id, element.name)));

    this.dataChange = new BehaviorSubject<StaffModel[]>([]);
    this.staffService.getAllActiveUsers(this.login.companyId, undefined).subscribe(
      data => {
        data.sort((a, b) => a.name.localeCompare(b.name));
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
export class ExampleDataSource extends DataSource<StaffModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: StaffModel[] = [];
  renderedData: StaffModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<StaffModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): StaffModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<StaffModel[]> {
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
          .filter((staff: StaffModel) => {
            const searchStr = (
              staff.name +
              staff.mobile
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
  sortData(data: StaffModel[]): StaffModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'id':
          [propertyA, propertyB] = [a.id, b.id];
          break;
        case 'name':
          [propertyA, propertyB] = [a.name, b.name];
          break;
        case 'date':
          [propertyA, propertyB] = [a.dob, b.dob];
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