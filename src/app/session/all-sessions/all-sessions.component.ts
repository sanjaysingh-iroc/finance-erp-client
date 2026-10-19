import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from '../../session/session.service';
import { SessionModel } from '../session.model';
import { Router } from '@angular/router';
import { settings } from '../../demo/data';

@Component({
  selector: 'app-all-sessions',
  templateUrl: './all-sessions.component.html',
  styleUrls: ['./all-sessions.component.sass']
})
export class AllSessionsComponent implements OnInit {

  displayedColumns = [
    'id',
    'name',
    'fromDate',
    'toDate',
    'actions'
  ];
  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<SessionModel>(true, []);
  sessionModel: SessionModel | null;
  dataChange: BehaviorSubject<SessionModel[]> = new BehaviorSubject<SessionModel[]>([]);
  showDateFormat: string = settings.SHOW_DATE_FORMAT;

  constructor(
    private sessionService: SessionService,
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

  addNew() {
    this.router.navigate(['finance/session/add-session']);
  }

  editCall(row) {
    this.router.navigateByUrl('finance/session/add-session', { state: { sessionModel: row, action: 'edit' } });
  }

  public loadData() {
    this.dataChange = new BehaviorSubject<SessionModel[]>([]);
    this.sessionService.getAllSessionYears().subscribe(data => {
      data.sort((a, b) => a.id > b.id ? -1 : 1);
      this.dataChange.next(data);
    });

    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort
    );
  }

}
export class ExampleDataSource extends DataSource<SessionModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: SessionModel[] = [];
  renderedData: SessionModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<SessionModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): SessionModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<SessionModel[]> {
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
          .filter((sessionModel: SessionModel) => {
            const searchStr = (
              sessionModel.name +
              sessionModel.fromDate +
              sessionModel.toDate
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
  sortData(data: SessionModel[]): SessionModel[] {
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
        case 'fromDate':
          [propertyA, propertyB] = [a.fromDate, b.fromDate];
          break;
        case 'toDate':
          [propertyA, propertyB] = [a.toDate, b.toDate];
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
