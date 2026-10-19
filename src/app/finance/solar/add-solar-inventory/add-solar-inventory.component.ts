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
import { SolarProductInventoryModel } from '../solar-billing.model';
import { SolarService } from '../solar.service';
const _ = require('lodash');

@Component({
  selector: 'app-add-solar-inventory',
  templateUrl: './add-solar-inventory.component.html',
  styleUrls: ['./add-solar-inventory.component.sass']
})

export class AddSolarInventoryComponent implements OnInit {

  billForm: FormGroup;

  purchaseSolarPanels = new FormArray([]);
  purchaseSolarInverters = new FormArray([]);
  purchaseSolarProducts = new FormArray([]);

  purchaseProducts = new FormArray([]);
  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();

  productNameList: ProductBrandModel[] = [];

  solarPanelList: ProductBrandModel[] = [];
  solarInverterList: ProductBrandModel[] = [];
  solarProductList: ProductBrandModel[] = [];

  spinnerButtonOptions: MatProgressButtonOptions;

  login: LoginModel;

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

    this.purchaseSolarPanels.push(this.initSectionRow(0, 0, 0));
    this.purchaseSolarInverters.push(this.initSectionRow(0, 0, 0));
    this.purchaseSolarProducts.push(this.initSectionRow(0, 0, 0));

    this.spinnerButtonOptions = this.commonLayout.getprogressButton();

    this.utilsService.getBrandDetails().subscribe(data => {
      data.forEach(brand => this.brandMap.set(brand.id, brand));

      this.productService.getAllProducts(this.login.companyId,).subscribe(data => {
        data.forEach(product => {

          if (product.productType == 13) {
            this.purchaseProducts.push(this.initSectionRow(0, product.id, 0));
          } else if (product.productType == 10) {
            this.solarPanelList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });

          } else if (product.productType == 11 || product.productType == 12) {
            this.solarInverterList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          } else if (product.productType == 15) {
            this.solarProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          }

          this.productNameList.push({
            id: product.id,
            name: product.modelNo
          });
        });

        this.productNameList.sort((a, b) => a.name.localeCompare(b.name));
      });
    });

    this.billForm = this.fb.group({
      purchaseSolarPanels: this.purchaseSolarPanels,
      purchaseSolarInverters: this.purchaseSolarInverters,
      purchaseSolarProducts: this.purchaseSolarProducts,
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

  addNewPanelRow() {
    this.purchaseSolarPanels.push(this.initSectionRow());
  }

  removeNewPanelRow(index) {
    this.purchaseSolarPanels.removeAt(index);
  }

  addNewInverterRow() {
    this.purchaseSolarInverters.push(this.initSectionRow());
  }

  removeNewInverterRow(index) {
    this.purchaseSolarInverters.removeAt(index);
  }

  addNewRow() {
    this.purchaseSolarProducts.push(this.initSectionRow());
  }

  removeNewRow(index) {
    this.purchaseSolarProducts.removeAt(index);
  }

  onSubmit() {
    this.addNewBillingModel();
  }

  addNewBillingModel() {
    const billingProductModels: SolarProductInventoryModel[] = [];

    for (let purchaseProduct of this.billForm.get("purchaseSolarPanels").value) {
      if (purchaseProduct.quantity > 0 && purchaseProduct.productId > 0) {
        billingProductModels.push(this.getBillingProduct(purchaseProduct));
      }
    }

    for (let purchaseProduct of this.billForm.get("purchaseSolarInverters").value) {
      if (purchaseProduct.quantity > 0 && purchaseProduct.productId > 0) {
        billingProductModels.push(this.getBillingProduct(purchaseProduct));
      }
    }

    for (let purchaseProduct of this.billForm.get("purchaseSolarProducts").value) {
      if (purchaseProduct.quantity > 0 && purchaseProduct.productId > 0) {
        billingProductModels.push(this.getBillingProduct(purchaseProduct));
      }
    }

    for (let purchaseProduct of this.billForm.get("purchaseProducts").value) {
      if (purchaseProduct.quantity > 0) {
        billingProductModels.push(this.getBillingProduct(purchaseProduct));
      }
    }

    this.billingService.addNewSolarInventory(billingProductModels).pipe(first()).subscribe(data => {
      this.router.navigate(['billing/finance/reports/solar-inventory-report']);
    });

  }

  getBillingProduct(purchaseProduct) {
    return {
      companyId: this.login.companyId,
      productId: purchaseProduct.productId,
      quantity: purchaseProduct.quantity,
    };
  }


}
