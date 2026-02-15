import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, Observable, merge } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { map } from 'rxjs/operators';
import { ExcelExportService } from '../../shared/excelExport/excelExport-service';
import { PdfService } from '../../shared/pdfServices/pdfExport';
import { Router } from '@angular/router';
import { UtilsService } from '../../shared/services/utils.service';
import { BrandModel, ProductBrandModel, ProductCategoryModel } from '../../shared/common.models';
import { FormControl } from '@angular/forms';
import { ProductModel } from '../../products/product.model';
import { ProductService } from '../../products/product.service';
import { BillingService } from '../../billing/billing.service';

@Component({
  selector: 'app-inventory-report',
  templateUrl: './inventory-report.component.html',
  styleUrls: ['./inventory-report.component.sass']
})
export class InventoryReportComponent implements OnInit {
  displayedColumns = [
    'productType',
    'brandId',
    'modelNo',
    'capacity',
    'purchaseQnty',
    'sellQnty',
    'balanceQnty'
  ];
  dataSource: ExampleDataSource | null;
  dataChange: BehaviorSubject<number[][]> = new BehaviorSubject<number[][]>([]);

  productCategoryList: ProductCategoryModel[] = [];
  productCategoryIdControl = new FormControl('');

  brandModelMap: Map<number, string> = new Map<number, string>();
  brandIdControl = new FormControl('');

  productCategoryChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  brandMapChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());

  productMapChange: BehaviorSubject<Map<number, ProductModel>> = new BehaviorSubject<Map<number, ProductModel>>(new Map<number, ProductModel>());

  brandList: BrandModel[] = [];
  productMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  productNameList: ProductBrandModel[] = [];
  productQuantityMap: Map<number, number> = new Map<number, number>();
  billingProductQuantityMap: Map<number, number> = new Map<number, number>();
  productCategoryNameMap: Map<number, string> = new Map<number, string>();
  allProductQuantity: number[][] = [];

  constructor(
    private productService: ProductService,
    private pdfService: PdfService,
    private excelExportService: ExcelExportService,
    private utilsService: UtilsService,
    private billingService: BillingService,
  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  ngOnInit() {
    this.productMapChange = new BehaviorSubject<Map<number, ProductModel>>(new Map<number, ProductModel>());

    this.productService.getAllProducts().subscribe(data => {
      data.forEach(product => {
        this.productMap.set(product.id, product);
      });

      this.productMapChange.next(this.productMap);
    });

    this.billingService.getAllProductQuantity().subscribe(data => {
      data.forEach(product => {
        this.billingProductQuantityMap.set(product[0], product[1]);
      });
    });

    this.productCategoryChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
    this.brandMapChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());

    this.utilsService.getAllProductCategory().subscribe(data => {
      this.productCategoryList = data;
      data.forEach(element => {
        this.productCategoryNameMap.set(element.id, element.name);
      });
      this.productCategoryChange.next(this.productCategoryNameMap);
    });

    this.utilsService.getBrandDetails().subscribe(data => {
      this.brandList = data;
      data.forEach(element => {
        this.brandModelMap.set(element.id, element.name);
      });
      this.brandMapChange.next(this.brandModelMap);
    });

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
      // row.push(p.modelNo);
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
      // row.push({ text: p.modelNo, style: 'subheader' });
      data.push(row);
    });

    return data;
  }

  filterBrandWise() {
    const brandId = this.brandIdControl.value;
    const productCategoryId = this.productCategoryIdControl.value;

    let allProductModels: number[][] = [...this.allProductQuantity];
    if (brandId != 0) {
      allProductModels = allProductModels.filter(productModel => this.productMap.get(productModel[0]).brandId == brandId);
    }

    if (productCategoryId != 0) {
      allProductModels = allProductModels.filter(productModel => this.productMap.get(productModel[0]).productType == productCategoryId);
    }

    this.dataChange.next(allProductModels);
    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort,
      this.brandMapChange,
      this.productCategoryChange,
      this.productMapChange
    );
    fromEvent(this.filter.nativeElement, 'keyup')
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }


  public loadData() {
    this.dataChange = new BehaviorSubject<number[][]>([]);

    this.productService.getAllProductQuantity().subscribe(data => {
      this.dataChange.next(data);
      this.allProductQuantity = data;

      data.forEach(product => {
        this.productQuantityMap.set(product[0], product[1]);
      });
    });

    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort,
      this.brandMapChange,
      this.productCategoryChange,
      this.productMapChange
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
export class ExampleDataSource extends DataSource<number[]> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: number[][] = [];
  renderedData: number[][] = [];
  constructor(
    public dataChange: BehaviorSubject<number[][]>,
    public _paginator: MatPaginator,
    public _sort: MatSort,
    public dataChange1: BehaviorSubject<Map<number, string>>,
    public dataChange2: BehaviorSubject<Map<number, string>>,
    public dataChange3: BehaviorSubject<Map<number, ProductModel>>,

  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): number[][] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<number[][]> {
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
        const productMapChange: Map<number, ProductModel> = this.dataChange3.value;

        // Filter data
        this.filteredData = this.data
          .slice()
          .filter((productModel: number[]) => {
            const searchStr = (
              productMapChange.get(productModel[0])?.modelNo.toLowerCase() +
              productMapChange.get(productModel[0])?.capacity.toLowerCase() +
              brandMapChange.get(productMapChange.get(productModel[0])?.brandId)?.toLowerCase() +
              productTypeMapChange.get(productMapChange.get(productModel[0])?.productType)?.toLowerCase()
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice(), brandMapChange, productTypeMapChange, productMapChange);
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
  sortData(data: number[][], brandMapChange: Map<number, string>, productTypeMapChange: Map<number, string>, productMapChange: Map<number, ProductModel>): number[][] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'capacity':
          [propertyA, propertyB] = [productMapChange.get(a[0])?.capacity, productMapChange.get(b[0])?.capacity];
          break;
        case 'modelNo':
          [propertyA, propertyB] = [productMapChange.get(a[0])?.modelNo.toLowerCase(), productMapChange.get(b[0])?.modelNo.toLowerCase()];
          break;
        case 'brandId':
          [propertyA, propertyB] = [brandMapChange.get(productMapChange.get(a[0])?.brandId)?.toLowerCase(), brandMapChange.get(productMapChange.get(b[0])?.brandId)?.toLowerCase()];
          break;
        case 'productType':
          [propertyA, propertyB] = [productTypeMapChange.get(productMapChange.get(a[0])?.productType)?.toLowerCase(), productTypeMapChange.get(productMapChange.get(b[0])?.productType)?.toLowerCase()];
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
