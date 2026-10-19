import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BrandModel, ProductBrandModel } from '../../../shared/common.models';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductService } from '../../products/product.service';
import { LoginModel } from '../../../auth/login-model';
import { SolarProductInventoryModel, SolarProductMinimumModel } from '../solar-billing.model';
import { SolarService } from '../solar.service';
const _ = require('lodash');

@Component({
  selector: 'app-add-minimum-solar-item',
  templateUrl: './add-minimum-solar-item.component.html',
  styleUrls: ['./add-minimum-solar-item.component.sass']
})

export class AddMinimumSolarItemsComponent implements OnInit {

  billForm: FormGroup;

  purchaseProducts = new FormArray([]);
  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();

  productNameList: ProductBrandModel[] = [];

  solarPanelList: ProductBrandModel[] = [];
  solarInverterList: ProductBrandModel[] = [];
  solarProductList: ProductBrandModel[] = [];

  spinnerButtonOptions: MatProgressButtonOptions;

  login: LoginModel;
  solarProductMinimumModelMap: Map<number, number> = new Map<number, number>();

  constructor(
    private fb: FormBuilder,
    private billingService: SolarService,
    private utilsService: UtilsService,
    private productService: ProductService,
    private localStorageData: LocalStorageData,
    private router: Router,
    private commonLayout: CommonLayout,
  ) { }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;


    this.spinnerButtonOptions = this.commonLayout.getprogressButton();

    this.billingService.getAllMinimumItems(3).subscribe(data => {
      data.forEach(element => {
        this.solarProductMinimumModelMap.set(element.productId, element.quantity);
      });
      this.utilsService.getBrandDetails().subscribe(data => {
        data.forEach(brand => this.brandMap.set(brand.id, brand));

        this.productService.getAllProducts(this.login.companyId,).subscribe(data => {
          data.forEach(product => {

            if (product.productType == 13) {
              this.purchaseProducts.push(this.initSectionRow(0, product.id, this.solarProductMinimumModelMap.get(product.id)));
              this.productNameList.push({
                id: product.id,
                name: product.modelNo
              });
            } else if (product.productType == 10 || product.productType == 11 || product.productType == 12 || product.productType == 15) {
              this.solarPanelList.push({
                id: product.id,
                name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
              });
              this.productNameList.push({
                id: product.id,
                name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
              });
              this.purchaseProducts.push(this.initSectionRow(0, product.id, this.solarProductMinimumModelMap.get(product.id)));
            }


          });

          this.productNameList.sort((a, b) => a.name.localeCompare(b.name));
        });
      });


    });


    this.billForm = this.fb.group({
      capacity: new FormControl(3),
      purchaseProducts: this.purchaseProducts,
    });

  }

  initSectionRow(id = 0, productId: number | undefined = undefined, quantity = 0) {
    return this.fb.group({
      id: new FormControl(id),
      productId: new FormControl(productId, [Validators.required]),
      quantity: new FormControl(quantity, [Validators.required, Validators.min(1)]),
    });
  }

  onSubmit() {
    this.addNewBillingModel();
  }

  addNewBillingModel() {
    const billingProductModels: SolarProductMinimumModel[] = [];

    const capacity: number = this.billForm.get("capacity").value;


    for (let purchaseProduct of this.billForm.get("purchaseProducts").value) {
      if (purchaseProduct.quantity > 0) {
        billingProductModels.push(this.getBillingProduct(purchaseProduct, capacity));
      }
    }

    this.billingService.addNewSolarminimumItems(billingProductModels).pipe(first()).subscribe(data => {
      this.router.navigate(['billing/finance/reports/solar-inventory-report']);
    });

  }

  getBillingProduct(purchaseProduct, capacity: number) {
    return {
      capacity: capacity,
      productId: purchaseProduct.productId,
      quantity: purchaseProduct.quantity,
    };
  }


}
