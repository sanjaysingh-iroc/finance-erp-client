import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, Observable, merge } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { map } from 'rxjs/operators';
import { ProductModel } from '../product.model';
import { ProductService } from '../product.service';
import { settings } from '../../demo/data';
import { ExcelExportService } from '../../shared/excelExport/excelExport-service';
import { PdfService } from '../../shared/pdfServices/pdfExport';
import { Router } from '@angular/router';
import { LocalStorageData } from '../../shared/local-storage-data';
import { VendorService } from '../../vendors/vendor.service';
import { UtilsService } from '../../shared/services/utils.service';
import { BrandModel, ProductCategoryModel } from '../../shared/common.models';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-all-products',
  templateUrl: './all-products.component.html',
  styleUrls: ['./all-products.component.sass']
})

export class AllProductsComponent implements OnInit {
  displayedColumns = [
    'productType',
    'brandId',
    'modelNo',
    'rateWithGST',
    'gstPercentage',
    'priceWithGST',
    'warranty',
    'capacity',
    'distributorName',
    'details',
    'actions'
  ];
  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<ProductModel>(true, []);
  productModel: ProductModel | null;
  dataChange: BehaviorSubject<ProductModel[]> = new BehaviorSubject<ProductModel[]>([]);
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  productCategoryMap: Map<number, ProductCategoryModel> = new Map<number, ProductCategoryModel>();
  productCategoryList: ProductCategoryModel[] = [];
  productCategoryIdControl = new FormControl('');

  brandModelMap: Map<number, string> = new Map<number, string>();
  brandList: BrandModel[] = [];
  brandIdControl = new FormControl('');

  vendorMap: Map<number, string> = new Map<number, string>();
  allProductModels: ProductModel[];
  productCategoryChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  brandMapChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());

  constructor(
    private productService: ProductService,
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

    this.productCategoryChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
    this.brandMapChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
    const productCategoryNameMap: Map<number, string> = new Map<number, string>();
    // const productCategoryNameMap: Map<number, string> = new Map<number, string>();


    this.utilsService.getAllProductCategory().subscribe(data => {
      this.productCategoryList = data;
      data.forEach(element => {
        this.productCategoryMap.set(element.id, element);
        productCategoryNameMap.set(element.id, element.name);
      });

      this.productCategoryChange.next(productCategoryNameMap);

    });

    this.utilsService.getBrandDetails().subscribe(data => {
      this.brandList = data;
      data.forEach(element => {
        this.brandModelMap.set(element.id, element.name);

      });

      this.brandMapChange.next(this.brandModelMap);

    });

    this.vendorService.getAllVendors()
      .subscribe(data => data.forEach(element => this.vendorMap.set(element.id, element.firmName)));
    this.loadData();
  }

  refresh() {
    this.loadData();
  }

  generatePDF(action = 'open') {
    let data: string[][] = this.getData();
    this.pdfService.generatePDF('Product Details', [], data, { alignment: 'center', margin: [150, 5, 0, 15] }, 'portrait', action, 1);
  }

  private getHeaderCaption() {
    return [
      { text: 'Sr. No.', style: 'tableHeader' },
      { text: 'Product Name', style: 'tableHeader' },
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
      row.push(p.modelNo);
      data.push(row);
    });

    this.excelExportService.exportExcel(columns, data, "Products Details", "AllProducts");
  }

  private getData() {
    let data = [];
    let index = 0;
    data.push(this.getHeaderCaption());
    this.dataChange.value.map(p => {
      let row = [];
      row.push({ text: (++index).toString(), style: 'subheader' });
      row.push({ text: p.modelNo, style: 'subheader' });
      data.push(row);
    });

    return data;
  }

  addNew() {
    this.router.navigate(['pages/products/add-product']);

  }

  editCall(row) {
    this.router.navigateByUrl('pages/products/add-product', { state: { productModel: row, action: 'edit' } });
  }

  filterBrandWise() {
    const brandId = this.brandIdControl.value;
    const productCategoryId = this.productCategoryIdControl.value;

    let allProductModels: ProductModel[] = [...this.allProductModels];
    if (brandId != 0) {
      allProductModels = allProductModels.filter(productModel => productModel.brandId == brandId);
    }

    if (productCategoryId != 0) {
      allProductModels = allProductModels.filter(productModel => productModel.productType == productCategoryId);
    }
    this.dataChange.next(allProductModels);
    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort,
      this.brandMapChange,
      this.productCategoryChange
    );
    fromEvent(this.filter.nativeElement, 'keyup')
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  filterProductCategoryWise() {
    const brandId = this.brandIdControl.value;
    let allProductModels: ProductModel[] = [...this.allProductModels];
    if (brandId != 0) {
      allProductModels = allProductModels.filter(billingModel => billingModel.brandId == brandId);
    }
    this.dataChange.next(allProductModels);
    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort,
      this.brandMapChange,
      this.productCategoryChange
    );
    fromEvent(this.filter.nativeElement, 'keyup')
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  roundOffAmount(amount: number) {
    return Math.ceil(amount);
  }

  public loadData() {
    const session = this.localStorageData.sessionValue;
    this.dataChange = new BehaviorSubject<ProductModel[]>([]);
    this.productService.getAllProducts().subscribe(
      data => {
        this.dataChange.next(data);
        this.allProductModels = data;
      }
    );
    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort,
      this.brandMapChange,
      this.productCategoryChange
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
export class ExampleDataSource extends DataSource<ProductModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: ProductModel[] = [];
  renderedData: ProductModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<ProductModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort,
    public dataChange1: BehaviorSubject<Map<number, string>>,
    public dataChange2: BehaviorSubject<Map<number, string>>,

  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): ProductModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ProductModel[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page,
    ];
    return merge(...displayDataChanges).pipe(
      map(() => {
        const brandMapChange: Map<number, string> = this.dataChange1.value;
        const productTypeMapChange: Map<number, string> = this.dataChange2.value;

        // Filter data
        this.filteredData = this.data
          .slice()
          .filter((productModel: ProductModel) => {
            const searchStr = (
              productModel.modelNo.toLowerCase() +
              brandMapChange.get(productModel.brandId)?.toLowerCase() +
              productTypeMapChange.get(productModel.productType)?.toLowerCase()
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice(), brandMapChange, productTypeMapChange);
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
  sortData(data: ProductModel[], brandMapChange: Map<number, string>, productTypeMapChange: Map<number, string>): ProductModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'priceWithGST':
          [propertyA, propertyB] = [a.price, b.price];
          break;
        case 'modelNo':
          [propertyA, propertyB] = [a.modelNo.toLowerCase(), b.modelNo.toLowerCase()];
          break;
        case 'brandId':
          [propertyA, propertyB] = [brandMapChange.get(a.brandId)?.toLowerCase(), brandMapChange.get(b.brandId)?.toLowerCase()];
          break;
        case 'productType':
          [propertyA, propertyB] = [productTypeMapChange.get(a.productType)?.toLowerCase(), productTypeMapChange.get(b.productType)?.toLowerCase()];

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
