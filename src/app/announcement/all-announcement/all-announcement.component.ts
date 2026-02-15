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
import { AnnouncementService } from '../../announcement/announcement.service';
import { DeleteDialogComponent } from '../../shared/dialog/delete/delete.component';
import { AnnouncementModel } from '../announcement.model';
import { Router } from '@angular/router';
import { settings } from '../../demo/data';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-all-announcement',
  templateUrl: './all-announcement.component.html',
  styleUrls: ['./all-announcement.component.sass']
})
export class AllAnnouncementComponent implements OnInit {

  displayedColumns = [
    'message',
    'createDate',
    'actions'
  ];
  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<AnnouncementModel>(true, []);
  announcementModel: AnnouncementModel | null;
  dataChange: BehaviorSubject<AnnouncementModel[]> = new BehaviorSubject<AnnouncementModel[]>([]);
  showDateFormat: string = settings.SHOW_DATE_FORMAT;

  constructor(
    private dialog: MatDialog,
    private announcementService: AnnouncementService,
    private notification: NotificationsService,
    private pdfService: PdfService,
    private excelExportService: ExcelExportService,
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

  generatePDF(action = 'open') {
    let data: any[][] = [];
    data.push(this.getHeaderCaption());
    let index = 0;
    this.dataChange.value.map(p => {
      let row = [];
      row.push({ text: (++index).toString(), style: 'subheader' });
      row.push({ text: p.message, style: 'justifyStyle' });
      row.push({ text: formatDate(p.createDate, settings.SHOW_DATE_FORMAT, 'en'), style: 'subheader' });
      data.push(row);
    });
    this.pdfService.generatePDF('Announcement Details', [], data, { alignment: 'center', margin: [0, 5, 0, 15] }, 'portrait', action, 1);
  }

  private getHeaderCaption() {
    return [
      { text: 'Sr. No.', style: 'tableHeader' },
      { text: 'Announcement Name', style: 'tableHeader' },
      { text: 'Messege', style: 'tableHeader' },
      { text: 'Expiry Date', style: 'tableHeader' },
    ];
  }

  exportExcel() {
    let columns = [
      { header: 'Sr. No.', key: 'name', width: 10 },
      { header: 'Announcement Name', key: 'name', width: 20 },
      { header: 'Messege', key: 'name', width: 20 },
      { header: 'Expiry Date', key: 'name', width: 20 }
    ];

    let data = [];
    let index = 0;
    this.dataChange.value.forEach(e => {
      let row = [];
      row.push((++index).toString());
      row.push(e.message);
      row.push(formatDate(e.createDate, settings.SHOW_DATE_FORMAT, 'en'));
      data.push(row);
    });
    this.excelExportService.exportExcel(columns, data, "Announcement Details", "AllAnnouncement");
  }

  addNew() {
    this.router.navigate(['pages/announcement/add-announcement']);
  }

  editCall(row) {
    this.router.navigateByUrl('pages/announcement/add-announcement', { state: { announcementModel: row, action: 'edit' } });
  }

  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: row.name,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.announcementService.deleteAnnouncement(id).subscribe(() => {
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

  public loadData() {
    this.dataChange = new BehaviorSubject<AnnouncementModel[]>([]);
    this.announcementService.getAllActiveAnnouncements().subscribe(
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
export class ExampleDataSource extends DataSource<AnnouncementModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: AnnouncementModel[] = [];
  renderedData: AnnouncementModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<AnnouncementModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): AnnouncementModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<AnnouncementModel[]> {
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
          .filter((announcementModel: AnnouncementModel) => {
            const searchStr = (
              announcementModel.message +
              announcementModel.createDate
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
  sortData(data: AnnouncementModel[]): AnnouncementModel[] {
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
        case 'message':
          [propertyA, propertyB] = [a.message, b.message];
          break;
        case 'createDate':
          [propertyA, propertyB] = [a.createDate, b.createDate];
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
