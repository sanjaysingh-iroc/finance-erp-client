import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, Observable, merge } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { map } from 'rxjs/operators';
import { DeleteDialogComponent } from '../../../shared/dialog/delete/delete.component';
import { NotificationsService } from '../../../shared/notifications-service';
import { HolidayModel } from '../holiday.model';
import { HolidayService } from '../holiday.service';
import { settings } from '../../../demo/data';
import { ExcelExportService } from '../../../shared/excelExport/excelExport-service';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { Router } from '@angular/router';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-all-holidays',
  templateUrl: './all-holidays.component.html',
  styleUrls: ['./all-holidays.component.sass']
})

export class AllHolidaysComponent implements OnInit {
  displayedColumns = [
    'select',
    'name',
    'date',
    'actions'
  ];
  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<HolidayModel>(true, []);
  holidayModel: HolidayModel | null;
  dataChange: BehaviorSubject<HolidayModel[]> = new BehaviorSubject<HolidayModel[]>([]);
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  constructor(
    private dialog: MatDialog,
    private holidayService: HolidayService,
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
    this.loadData();
  }

  refresh() {
    this.loadData();
  }

  addNew() {
    this.router.navigate(['billing/finance/holidays/add-holiday']);

  }

  editCall(row) {
    this.router.navigateByUrl('billing/finance/holidays/add-holiday', { state: { holidayModel: row, action: 'edit' } });
  }

  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: row.name,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.holidayService.deleteHoliday(id).subscribe(() => {
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
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.renderedData.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.renderedData.forEach((row) =>
        this.selection.select(row)
      );
  }

  removeSelectedRows() {
    const totalSelect = this.selection.selected.length;
    const ids = [];
    this.selection.selected.forEach((item) => {
      ids.push(item.id);
    });
    this.holidayService.deleteHoliday(ids.toString()).subscribe(() => {
      this.selection = new SelectionModel<HolidayModel>(true, []);
      this.loadData();
      this.notification.showDangerNotification(
        totalSelect + 'All Selected Record Delete Successfully...!!!',
        'bottom'
      );
    });
  }
  public loadData() {
    const session = this.localStorageData.sessionValue;
    this.dataChange = new BehaviorSubject<HolidayModel[]>([]);
    this.holidayService.getAllHolidays(session.id).subscribe(
      data => {
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
export class ExampleDataSource extends DataSource<HolidayModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: HolidayModel[] = [];
  renderedData: HolidayModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<HolidayModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): HolidayModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<HolidayModel[]> {
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
          .filter((holidayModel: HolidayModel) => {
            const searchStr = (
              holidayModel.name
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
  sortData(data: HolidayModel[]): HolidayModel[] {
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
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1)
      );
    });
  }
}
