import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AssociateService } from '../associate.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AssociateModel } from '../associate.model';
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
  selector: 'app-all-associate',
  templateUrl: './all-associate.component.html',
  styleUrls: ['./all-associate.component.sass']
})
export class AllassociateComponent implements OnInit {
  displayedColumns = [
    'img',
    'name',
    'fatherName',
    'mobile',
    'idProof',
    'actions'
  ];

  dataSource: ExampleDataSource | null;
  associate: AssociateModel | null;
  dataChange: BehaviorSubject<AssociateModel[]> = new BehaviorSubject<AssociateModel[]>([]);
  showDateFormat: string;
  apiURL: string = environment.apiUrl;
  session: SessionModel;
  login: LoginModel;

  constructor(
    private dialog: MatDialog,
    private associateService: AssociateService,
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

  updateAssociateUrl(event, row) {
    event.target.src = "assets/images/user/avatar.png";
  }
  refresh() {
    this.loadData();
  }

  viewAssociateProfile(associate) {
    this.router.navigateByUrl('finance/associates/about-associate', { state: { associate: associate, action: 'view' } });
  }

  get data(): AssociateModel[] {
    return this.dataChange.value;
  }

  addNew() {
    this.router.navigate(['finance/associates/add-associate']);
  }

  editCall(row) {
    this.router.navigateByUrl('finance/associates/add-associate', { state: { associateModel: row, action: 'edit' } });
  }

  updateAssociate(associate, id) {
    this.associateService.addNewAssociate(associate).subscribe(
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
      data: { associate: row, sessionYear: this.session.id, exitDate: formatDate(new Date(), settings.SAVE_DATE_FORMAT, 'en') }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.associateService.deleteAssociate(id, formatDate(result.exitDate, settings.SAVE_DATE_FORMAT, 'en')).subscribe(() => {
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

  public loadData() {
    this.dataChange = new BehaviorSubject<AssociateModel[]>([]);
    this.associateService.getAllActiveAssociates(this.login.companyId).subscribe(
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
export class ExampleDataSource extends DataSource<AssociateModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: AssociateModel[] = [];
  renderedData: AssociateModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<AssociateModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): AssociateModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<AssociateModel[]> {
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
          .filter((associate: AssociateModel) => {
            const searchStr = (
              associate.name +
              associate.mobile
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
  sortData(data: AssociateModel[]): AssociateModel[] {
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