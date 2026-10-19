import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { first, startWith, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SessionService } from '../../../session/session.service';
import { monthMap, settings } from '../../../demo/data';
import { formatDate } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BrandModel, FullName, PaymentTypeModel, ProductBrandModel, ProductCategoryModel, SettingModel } from '../../../shared/common.models';
import { SessionModel } from '../../../session/session.model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { UtilsService } from '../../../shared/services/utils.service';
import { InventoryModel, InventoryProductModel, ProductModel } from '../../products/product.model';
import { CompanyService } from '../../../company-settings/company.service';
import { Utils } from '../../../shared/util-class';
import { VendorService } from '../../vendors/vendor.service';
import { VendorModel } from '../../vendors/vendor.model';
import { ProductService } from '../product.service';
import { CompressImageService } from '../../../shared/services/CompressImageService';
import { LoginModel } from '../../../auth/login-model';
import { forkJoin, of } from 'rxjs';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.sass']
})
export class AddInventoryComponent implements OnInit {

  billForm: FormGroup;
  finalForm: FormGroup;
  purchaseProducts = new FormArray([]);
  brandList: BrandModel[] = [];
  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();

  productMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  productNameList: ProductBrandModel[] = [];

  paymentTypeMap: Map<number, PaymentTypeModel> = new Map<number, PaymentTypeModel>();
  showDateFormat: string = settings.SHOW_DATE_FORMAT;

  productCategoryModelsMap: Map<number, ProductCategoryModel> = new Map<number, ProductCategoryModel>();

  isCheque = false;
  session: SessionModel;
  spinnerButtonOptions: MatProgressButtonOptions;

  currency = settings.CURRENCY;
  settingModels: SettingModel[] = [];

  action: string;
  inventoryModel: InventoryModel;
  dialogTitle: string = 'Add';
  vendorModels: VendorModel[];
  login: LoginModel;
  apiURL: string = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private productService: ProductService,
    private companyService: CompanyService,
    private utils: Utils,
    private vendorService: VendorService,
    private compressImage: CompressImageService,

    private localStorageData: LocalStorageData,
    private dialog: MatDialog,
    private router: Router,
    private commonLayout: CommonLayout,
  ) { }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;

    this.vendorService.getAllVendors(this.login.companyId).subscribe(data => {
      data.sort((a, b) => a.firmName.localeCompare(b.firmName));
      this.vendorModels = data;
    });



    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.session = this.localStorageData.sessionValue;
    this.settingModels = this.localStorageData.settingValues;


    this.action = history.state.action;
    if (this.action == 'edit') {
      this.inventoryModel = history.state.inventoryModel;
      this.dialogTitle = 'Edit';
    } else {
      this.inventoryModel = new InventoryModel({ purchaseDate: new Date });
      this.purchaseProducts.push(this.initSectionRow());
    }

    this.utilsService.getAllProductCategory().subscribe(data => {
      data.forEach(productCategoryModel => this.productCategoryModelsMap.set(productCategoryModel.id, productCategoryModel));

      this.utilsService.getBrandDetails().subscribe(data => {
        this.brandList = data;
        data.forEach(brand => this.brandMap.set(brand.id, brand));

        this.productService.getAllProducts(this.login.companyId).subscribe(data => {
          data.forEach(product => {
            this.productMap.set(product.id, product);
            this.productNameList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          });
          this.productNameList.sort((a, b) => a.name.localeCompare(b.name));

          if (this.action == 'edit') {
            this.inventoryModel.inventoryProductModels.forEach(billingProductModel => {
              const amount = this.productMap.get(billingProductModel.productId) ? this.productMap.get(billingProductModel.productId).rate : 0;
              const gstPercentage: number = parseFloat(this.productCategoryModelsMap?.get(this.productMap.get(billingProductModel.productId)?.productType)?.gstPercentage.toFixed(2));
              let cgstAmt = parseFloat(((amount * gstPercentage) / 200).toFixed(2));
              let sgstAmt = cgstAmt;
              const quantity = billingProductModel.quantity ? billingProductModel.quantity : 0;
              this.purchaseProducts.push(this.initSectionRow(billingProductModel.id, billingProductModel.productId, billingProductModel.quantity, billingProductModel.serialNo, amount, cgstAmt + cgstAmt, amount + cgstAmt + cgstAmt, amount * quantity, (cgstAmt + cgstAmt) * quantity, (amount + cgstAmt + cgstAmt) * quantity, 0));
            });

          }

        });
      });
    });

    this.billForm = this.fb.group({
      purchaseProducts: this.purchaseProducts,
    });

    this.finalForm = this.fb.group({
      purchaseDate: [formatDate(this.inventoryModel.purchaseDate, settings.SAVE_DATE_FORMAT, 'en'), [Validators.required]],
      amount: [this.inventoryModel.amount, [Validators.required, Validators.min(0)]],
      gstAmount: [this.inventoryModel.gstAmount, [Validators.required, Validators.min(0)]],
      roundOffAmount: [this.inventoryModel.roundOffAmount],
      totalAmount: [this.inventoryModel.totalAmount, [Validators.required, Validators.min(0)]],
      totalAmountAfterroundOff: [this.inventoryModel.totalAmount - this.inventoryModel.roundOffAmount],
      distributorName: [this.inventoryModel.distributorName, [Validators.required]],
      invoice: [this.inventoryModel.invoice, [Validators.required]],
      details: [this.inventoryModel.details],
      uploadBill: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]

    });
  }

  updateCustomerUrl(event) {
    event.target.src = 'assets/images/blank_image.png';
  }

  initSectionRow(id = 0, productId = undefined, quantity = 1, serialNo = '', amountPerUnit = 0, gstAmountPerUnit = 0, totalAmountPerUnit = 0, amount = 0, gstAmount = 0, totalAmount = 0, gstPercentage = 0) {
    return this.fb.group({
      id: new FormControl(id),
      productId: new FormControl(productId, [Validators.required]),
      quantity: new FormControl(quantity, [Validators.required, Validators.min(1)]),
      serialNo: new FormControl(serialNo),
      gstPercentage: new FormControl(gstPercentage),

      amountPerUnit: new FormControl(amountPerUnit),
      gstAmountPerUnit: new FormControl(gstAmountPerUnit),
      totalAmountPerUnit: new FormControl(totalAmountPerUnit),
      amount: new FormControl(amount),
      gstAmount: new FormControl(gstAmount),
      totalAmount: new FormControl(totalAmount),
    });
  }

  addNewRow() {
    this.purchaseProducts.push(this.initSectionRow());
  }

  removeNewRow(index) {
    this.purchaseProducts.removeAt(index);
    this.setTotalAmount();
  }

  onQuantityChange(purchaseProduct, event) {
    const quantity: number = parseFloat((event.target as HTMLInputElement).value);
    const amount: number = parseFloat(purchaseProduct.controls.amountPerUnit.value.toFixed(2));
    const gstPercentage: number = parseFloat(this.productCategoryModelsMap?.get(this.productMap?.get(purchaseProduct.controls.productId.value)?.productType)?.gstPercentage.toFixed(2));

    let cgstAmt = parseFloat(((amount * gstPercentage) / 200).toFixed(2));
    let sgstAmt = cgstAmt;
    this.updateProductAmount(purchaseProduct, amount, cgstAmt + sgstAmt, quantity);
    this.setTotalAmount();
  }

  onProductChange(purchaseProduct) {
    const quantity: number = purchaseProduct.controls.quantity.value;

    const amount: number = parseFloat(this.productMap.get(purchaseProduct.controls.productId.value).price.toFixed(2));
    const gstPercentage: number = parseFloat(this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.controls.productId.value)?.productType)?.gstPercentage.toFixed(2));

    let cgstAmt = parseFloat(((amount * gstPercentage) / 200).toFixed(2));
    let sgstAmt = cgstAmt;
    purchaseProduct.get('gstPercentage').setValue(gstPercentage);
    purchaseProduct.get('amountPerUnit').setValue(amount);
    purchaseProduct.get('gstAmountPerUnit').setValue(cgstAmt + sgstAmt);
    purchaseProduct.get('totalAmountPerUnit').setValue(cgstAmt + sgstAmt + amount);

    this.updateProductAmount(purchaseProduct, amount, cgstAmt + sgstAmt, quantity);
    this.setTotalAmount();
  }

  onPriceChange(purchaseProduct, event) {
    const quantity: number = purchaseProduct.controls.quantity.value;

    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    const gstPercentage: number = this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.controls.productId.value)?.productType)?.gstPercentage;

    let cgstAmt = parseFloat(((amount * gstPercentage) / 200).toFixed(2));
    let sgstAmt = cgstAmt;

    purchaseProduct.get('gstAmountPerUnit').setValue(cgstAmt + sgstAmt);
    purchaseProduct.get('totalAmountPerUnit').setValue(cgstAmt + sgstAmt + amount);

    this.updateProductAmount(purchaseProduct, amount, cgstAmt + sgstAmt, quantity);
    this.setTotalAmount();
  }

  onTotalPriceChange(purchaseProduct, event) {
    // Remove GST: GST Amount = Original Cost – (Original Cost * (100 / (100 + GST% ) ) )
    const quantity: number = purchaseProduct.controls.quantity.value;

    const totalAmount: number = parseFloat((event.target as HTMLInputElement).value);
    const gstPercentage: number = this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.controls.productId.value)?.productType)?.gstPercentage;

    let cgstAmt: number = parseFloat(((totalAmount - (totalAmount * (100 / (100 + gstPercentage)))) / 2).toFixed(2));
    let amount: number = parseFloat((totalAmount - (cgstAmt + cgstAmt)).toFixed(2));

    purchaseProduct.get('amountPerUnit').setValue(amount);
    purchaseProduct.get('gstAmountPerUnit').setValue(cgstAmt + cgstAmt);

    this.updateProductAmount(purchaseProduct, amount, cgstAmt + cgstAmt, quantity);
    this.setTotalAmount();
  }

  updateProductAmount(purchaseProduct, amount: number, gstAmt: number, quantity: number) {

    purchaseProduct.get('amount').setValue((amount * quantity).toFixed(2));
    purchaseProduct.get('gstAmount').setValue((gstAmt * quantity).toFixed(2));
    purchaseProduct.get('totalAmount').setValue(((gstAmt + amount) * quantity).toFixed(2));
  }

  onRoundOffPriceChange() {
    const totalAmount = this.finalForm.get("totalAmount").value;
    const roundOffAmount = this.finalForm.get("roundOffAmount").value;

    this.finalForm.get('totalAmountAfterroundOff').setValue((totalAmount - roundOffAmount).toFixed(2));

  }

  setTotalAmount() {
    let finalAmount: number = 0;
    let finalGstAmount: number = 0;
    let finalTotalAmount: number = 0;

    for (const purchaseProduct of this.purchaseProducts.controls) {
      const amount = parseFloat(purchaseProduct.get('amount').value);
      const gstAmount = parseFloat(purchaseProduct.get('gstAmount').value);
      const totalAmount = parseFloat(purchaseProduct.get('totalAmount').value);

      finalAmount += amount;
      finalGstAmount += gstAmount;
      finalTotalAmount += totalAmount;

    }
    this.finalForm.get('roundOffAmount').setValue(0);
    this.finalForm.get('amount').setValue(finalAmount.toFixed(2));
    this.finalForm.get('gstAmount').setValue(finalGstAmount.toFixed(2));
    this.finalForm.get('totalAmount').setValue(finalTotalAmount.toFixed(2));
    this.finalForm.get('totalAmountAfterroundOff').setValue(finalTotalAmount.toFixed(2));

  }

  updateTotalAmount() {
    let totalAmount: number = 0;

    for (const purchaseProduct of this.purchaseProducts.controls) {
      const amount = parseFloat(purchaseProduct.get('totalAmount').value);
      totalAmount += amount;
    }
    this.finalForm.get('amount').setErrors({ notSame: true });
  }

  isAmountValid() {
    let finalAmount = this.finalForm.get("amount").value;
    if (finalAmount == null) {
      finalAmount = 0;
      this.finalForm.get('amount').setValue(0);
    }

    if (finalAmount == 0 && finalAmount == 0) {
      return true;
    }
    return false;

  }

  onSubmit() {
    // this.spinnerButtonOptions.active = true;
    const inventoryModel = new InventoryModel(this.finalForm.value);
    if (this.action == 'edit') {
      inventoryModel.id = this.inventoryModel.id;
    }
    inventoryModel.companyId = this.login.companyId;

    const inventoryProductModel: InventoryProductModel[] = [];

    for (let purchaseProduct of this.billForm.get("purchaseProducts").value) {
      inventoryProductModel.push({
        productId: purchaseProduct.productId,
        quantity: purchaseProduct.quantity,
        serialNo: purchaseProduct.serialNo,
        companyId: this.login.companyId
      });
    }

    inventoryModel.inventoryProductModels = inventoryProductModel;

    if (this.action == 'edit') {
      this.uploadAllDoc(inventoryModel);
    } else {
      this.productService.addNewInventory(inventoryModel).pipe(first()).subscribe((customerData) => {
        this.uploadAllDoc(customerData);
      });
    }
  }

  uploadAllDoc(inventoryModel: InventoryModel) {
    const apiCalls = {
      uploadBill: this.uploadDoc(inventoryModel.id, this.finalForm.value.uploadBill),
    };

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        inventoryModel.uploadBill = (results as any).uploadBill.fileDownloadUri ? (results as any).uploadBill.fileDownloadUri : this.inventoryModel.uploadBill;

        this.productService.addNewInventory(inventoryModel).pipe(first()).subscribe((customerData) => {
          this.router.navigate(['billing/finance/products/all-inventory']);
        });
      },
      error: (err) => console.error('One or more requests failed:', err)
    });
  }

  uploadDoc(id: number, uploadDoc) {
    if (uploadDoc) {
      let uploadImageData = new FormData();
      const file = uploadDoc.files[0];
      uploadImageData.append("file", file);
      uploadImageData.append("id", id + "");
      uploadImageData.append("location", "inventory");
      return this.utilsService.uploadFile(uploadImageData);
    } else {
      return of({});;
    }
  }

}
