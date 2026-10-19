import { Component, OnInit } from '@angular/core';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductCategoryModel } from '../../../shared/common.models';
import { FormControl } from '@angular/forms';
import { ProductModel } from '../../products/product.model';
import { ProductService } from '../../products/product.service';
import { LoginModel } from '../../../auth/login-model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { SolarService } from '../../solar/solar.service';
import { SolarProductMinimumModel } from '../../solar/solar-billing.model';

@Component({
  selector: 'app-solar-inventory-report',
  templateUrl: './solar-inventory-report.component.html',
  styleUrls: ['./solar-inventory-report.component.sass']
})
export class SolarInventoryReportComponent implements OnInit {

  productCategoryList: ProductCategoryModel[] = [];
  brandModelMap: Map<number, string> = new Map<number, string>();
  solarProductMinimumModelMap: Map<number, SolarProductMinimumModel> = new Map<number, SolarProductMinimumModel>();

  productList: ProductModel[] = [];
  allProductList: ProductModel[] = [];

  productQuantityMap: Map<number, number> = new Map<number, number>();
  productCategoryNameMap: Map<number, string> = new Map<number, string>();
  login: LoginModel;
  productCategoryIdControl = new FormControl('');

  constructor(
    private productService: ProductService,
    private utilsService: UtilsService,
    private solarBillingService: SolarService,
    private localStorageData: LocalStorageData,
  ) { }

  ngOnInit() {
    this.login = this.localStorageData.userValue;
    this.productService.getAllProducts(this.login.companyId).subscribe(data => {
      data.forEach(product => {
        if (product.productType >= 10 && product.productType <= 13) {
          this.productList.push(product);
          this.allProductList.push(product);
        }
      });
    });

    this.utilsService.getAllProductCategory().subscribe(data => {
      data.forEach(element => {
        if (element.id >= 10 && element.id <= 13) {
          this.productCategoryList.push(element);
          this.productCategoryNameMap.set(element.id, element.name);
        }

      });
    });

    this.utilsService.getBrandDetails().subscribe(data => {
      data.forEach(element => {
        this.brandModelMap.set(element.id, element.name);
      });
    });

    this.solarBillingService.getAllMinimumItems(3).subscribe(data => {
      data.forEach(element => {
        this.solarProductMinimumModelMap.set(element.productId, element);
      });
    });

    this.solarBillingService.getAllProductQuantity(this.login.companyId).subscribe(data => {
      data.forEach(product => {
        this.productQuantityMap.set(product[0], product[1]);
      });
    });
  }

  filterBrandWise() {
    const productCategoryId = this.productCategoryIdControl.value;
    this.productList = [];
    let allProductModels: ProductModel[] = [...this.allProductList];
    if (productCategoryId != 0) {
      allProductModels = allProductModels.filter(productModel => productModel.productType == productCategoryId);
    }
    this.productList = allProductModels;
  }

}

