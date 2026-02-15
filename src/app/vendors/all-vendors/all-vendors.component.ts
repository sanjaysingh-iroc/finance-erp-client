import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VendorService } from '../vendor.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { VendorModel } from '../vendor.model';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { settings } from '../../demo/data';
import { NotificationsService } from '../../shared/notifications-service';
import { ExcelExportService } from '../../shared/excelExport/excelExport-service';
import { PdfService } from '../../shared/pdfServices/pdfExport';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { UtilsService } from '../../shared/services/utils.service';
@Component({
  selector: 'app-all-vendors',
  templateUrl: './all-vendors.component.html',
  styleUrls: ['./all-vendors.component.sass']
})
export class AllVendorComponent implements OnInit {
  displayedColumns = [
    'firmName',
    'contactPersonName',
    'mobile',
    'email',
    'emergencyMobile',
    'actions'
  ];

  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<VendorModel>(true, []);
  vendor: VendorModel | null;
  dataChange: BehaviorSubject<VendorModel[]> = new BehaviorSubject<VendorModel[]>([]);
  showDateFormat: string;
  vendorTypeMap: Map<number, string> = new Map<number, string>();
  apiURL: string = environment.apiUrl;
  genderMap: Map<number, string> = new Map<number, string>();

  constructor(
    private vendorService: VendorService,
    private utilsService: UtilsService,
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
    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.utilsService.getAllGender()
      .subscribe(data => data.forEach(element => this.genderMap.set(element.id, element.name)));
    this.loadData();
  }

  updateVendorUrl(event, row) {
    event.target.src = row.gender == 1 ? "assets/images/user/male_teacher_avatar.png" : "assets/images/user/female_teacher_avatar.png";
  }
  refresh() {
    this.loadData();
  }

  viewVendorProfile(vendor) {
    this.router.navigateByUrl('pages/vendors/about-vendor', { state: { vendor: vendor, action: 'view' } });
  }

  get data(): VendorModel[] {
    return this.dataChange.value;
  }

  generatePDF(action = 'open') {
    let data: string[][] = this.getData();
    this.pdfService.generatePDF('Vendor Details', [], data, { alignment: 'center', margin: [80, 5, 0, 15] }, 'landscape', action, 1);

  }

  private getHeaderCaption() {
    return [
      { text: 'Sr. No.', style: 'tableHeader' },
      { text: 'Vendor Name', style: 'tableHeader' },
      { text: 'DOB', style: 'tableHeader' },
      { text: 'Gender', style: 'tableHeader' },
      { text: 'Mobile', style: 'tableHeader' },
      { text: 'Joining Date', style: 'tableHeader' },
      { text: 'Password', style: 'tableHeader' },
      { text: 'Vendor Type', style: 'tableHeader' }
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
    this.dataChange.value.map(vendorModel => {
      let row = [];
      row.push((++index).toString());
      row.push(vendorModel.contactPersonName);
      row.push(this.genderMap.get(vendorModel.gender));
      row.push(vendorModel.mobile);
      data.push(row);
    });

    this.excelExportService.exportExcel(columns, data, "Vendor Details", "AllVendor");
  }

  private getData() {
    let data = [];
    let index = 0;
    data.push(this.getHeaderCaption());
    this.dataChange.value.map(vendorModel => {
      let row = [];
      row.push({ text: (++index).toString(), style: 'subheader' });
      row.push({ text: vendorModel.contactPersonName, style: 'subheader' });
      row.push({ text: this.genderMap.get(vendorModel.gender), style: 'subheader' });
      row.push({ text: vendorModel.mobile, style: 'subheader' });
      data.push(row);
    });

    return data;
  }

  addNew() {
    this.router.navigate(['pages/vendors/add-vendor']);
  }

  editCall(row) {
    this.router.navigateByUrl('pages/vendors/add-vendor', { state: { vendorModel: row, action: 'edit' } });
  }

  updateVendor(vendor, id) {
    this.vendorService.addNewVendor(vendor).subscribe(
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

  public loadData() {


    this.dataChange = new BehaviorSubject<VendorModel[]>([]);
    this.vendorService.getAllVendors().subscribe(
      data => {
        data.sort((a, b) => a.contactPersonName.localeCompare(b.contactPersonName));
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
export class ExampleDataSource extends DataSource<VendorModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: VendorModel[] = [];
  renderedData: VendorModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<VendorModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the vendor changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): VendorModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<VendorModel[]> {
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
          .filter((vendor: VendorModel) => {
            const searchStr = (
              vendor.firmName +
              vendor.contactPersonName +
              vendor.mobile
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
  sortData(data: VendorModel[]): VendorModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'firmName':
          [propertyA, propertyB] = [a.firmName.toLowerCase(), b.firmName.toLowerCase()];
          break;
        case 'contactPersonName':
          [propertyA, propertyB] = [a.contactPersonName.toLowerCase(), b.contactPersonName.toLowerCase()];
          break;
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