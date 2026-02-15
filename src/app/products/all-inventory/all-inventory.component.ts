import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, Observable, merge } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { map } from 'rxjs/operators';
import { DeleteDialogComponent } from '../../shared/dialog/delete/delete.component';
import { NotificationsService } from '../../shared/notifications-service';
import { InventoryModel } from '../product.model';
import { ProductService } from '../product.service';
import { settings } from '../../demo/data';
import { ExcelExportService } from '../../shared/excelExport/excelExport-service';
import { PdfService } from '../../shared/pdfServices/pdfExport';
import { Router } from '@angular/router';
import { LocalStorageData } from '../../shared/local-storage-data';
import { formatDate } from '@angular/common';
import { VendorService } from '../../vendors/vendor.service';
import { UtilsService } from '../../shared/services/utils.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-all-inventory',
  templateUrl: './all-inventory.component.html',
  styleUrls: ['./all-inventory.component.sass']
})

export class AllInventoryComponent implements OnInit {
  displayedColumns = [
    'invoice',
    'amount',
    'gstAmount',
    'totalAmount',
    'distributorName',
    'purchadeDate',
    'downloadBill',
    'actions'
  ];
  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<InventoryModel>(true, []);
  inventoryModel: InventoryModel | null;
  dataChange: BehaviorSubject<InventoryModel[]> = new BehaviorSubject<InventoryModel[]>([]);
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  inventoryCategoryMap: Map<number, string> = new Map<number, string>();
  brandModelMap: Map<number, string> = new Map<number, string>();
  vendorMap: Map<number, string> = new Map<number, string>();

  apiURL: string = environment.apiUrl;

  constructor(
    private dialog: MatDialog,
    private productService: ProductService,
    private notification: NotificationsService,
    private pdfService: PdfService,
    private excelExportService: ExcelExportService,
    private localStorageData: LocalStorageData,
    private vendorService: VendorService,
    private utilsService: UtilsService,
    private router: Router
  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  ngOnInit() {

    this.showDateFormat = settings.SHOW_DATE_FORMAT;

    this.vendorService.getAllVendors()
      .subscribe(data => data.forEach(element => this.vendorMap.set(element.id, element.firmName)));
    this.loadData();
  }

  refresh() {
    this.loadData();
  }

  generatePDF(action = 'open') {
    let data: string[][] = this.getData();
    this.pdfService.generatePDF('Inventory Details', [], data, { alignment: 'center', margin: [150, 5, 0, 15] }, 'portrait', action, 1);
  }

  private getHeaderCaption() {
    return [
      { text: 'Sr. No.', style: 'tableHeader' },
      { text: 'Inventory Name', style: 'tableHeader' },
      { text: 'Date', style: 'tableHeader' }
    ];
  }

  exportExcel() {
    let s = this.getHeaderCaption();
    let columns = [];
    s.forEach(caption => {
      columns.push({ header: caption.text, key: caption.text, width: 20 });
    });

    let data = [];
    let index = 0;
    this.dataChange.value.map(p => {
      let row = [];
      row.push((++index).toString());
      data.push(row);
    });

    this.excelExportService.exportExcel(columns, data, "Inventorys Details", "AllInventorys");
  }

  private getData() {
    let data = [];
    let index = 0;
    data.push(this.getHeaderCaption());
    this.dataChange.value.map(p => {
      let row = [];
      row.push({ text: (++index).toString(), style: 'subheader' });
      data.push(row);
    });

    return data;
  }

  addNew() {
    this.router.navigate(['pages/products/add-inventory']);

  }

  editCall(row) {
    this.router.navigateByUrl('pages/products/add-inventory', { state: { inventoryModel: row, action: 'edit' } });
  }

  public loadData() {
    this.dataChange = new BehaviorSubject<InventoryModel[]>([]);
    this.productService.getAllInventory().subscribe(
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
export class ExampleDataSource extends DataSource<InventoryModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: InventoryModel[] = [];
  renderedData: InventoryModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<InventoryModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): InventoryModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<InventoryModel[]> {
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
          .filter((inventoryModel: InventoryModel) => {
            const searchStr = (
              inventoryModel.invoice
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
  sortData(data: InventoryModel[]): InventoryModel[] {
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
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1)
      );
    });
  }
}
