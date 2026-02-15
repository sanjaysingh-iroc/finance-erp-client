import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductModel } from '../product.model';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { ProductService } from '../product.service';
import { BrandModel, ProductCategoryModel } from '../../shared/common.models';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { UtilsService } from '../../shared/services/utils.service';
import { VendorModel } from '../../vendors/vendor.model';
import { VendorService } from '../../vendors/vendor.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.sass']
})
export class AddProductComponent {
  action: string;
  dialogTitle: string = 'Add';
  productModel: ProductModel;
  productForm: FormGroup;
  productCategoryModels: ProductCategoryModel[];
  vendorModels: VendorModel[];
  brandModels: BrandModel[];
  productCategoryModelsMap: Map<number, ProductCategoryModel> = new Map<number, ProductCategoryModel>();

  spinnerButtonOptions: MatProgressButtonOptions;

  rateWithGSTControl = new FormControl('');
  priceWithGSTControl = new FormControl('');
  gstPercentageControl = new FormControl('');

  constructor(private fb: FormBuilder,
    private productService: ProductService,
    private vendorService: VendorService,
    private utilsService: UtilsService,
    private compressImage: CompressImageService,
    private commonLayout: CommonLayout,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();

    this.utilsService.getBrandDetails().subscribe(data => {
      this.brandModels = data;
    });
    this.vendorService.getAllVendors().subscribe(data => {
      data.sort((a, b) => a.firmName.localeCompare(b.firmName));
      this.vendorModels = data;
    });

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.productModel = history.state.productModel;
      this.dialogTitle = 'Edit';

    } else {
      this.productModel = new ProductModel({});
    }

    this.utilsService.getAllProductCategory().subscribe(data => {
      this.productCategoryModels = data;
      data.forEach(productCategoryModel => this.productCategoryModelsMap.set(productCategoryModel.id, productCategoryModel));

      if (this.action == 'edit') {
        const productCategoryModel: ProductCategoryModel = this.productCategoryModelsMap.get(this.productModel.productType);
        const rateWithGST = this.getPriceWithGST(this.productModel.rate, productCategoryModel?.gstPercentage);
        const priceWithGST = this.getPriceWithGST(this.productModel.price, productCategoryModel?.gstPercentage);

        this.rateWithGSTControl.setValue(rateWithGST);
        this.priceWithGSTControl.setValue(priceWithGST);
        this.gstPercentageControl.setValue(productCategoryModel?.gstPercentage);
      }
    });

    this.productForm = this.fb.group({
      productType: [this.productModel.productType, [Validators.required]],
      brandId: [this.productModel.brandId, [Validators.required]],
      modelNo: [this.productModel.modelNo, [Validators.required]],
      hsnCode: [this.productModel.hsnCode, [Validators.required]],

      rate: [this.productModel.rate > 0 ? this.productModel.rate : '', [Validators.required, Validators.min(1)]],
      price: [this.productModel.price, [Validators.required, Validators.min(1)]],
      warrantyInYear: [this.productModel.warrantyInYear, [Validators.required, Validators.min(0)]],
      warrantyInMonth: [this.productModel.warrantyInMonth, [Validators.required, Validators.min(0)]],
      distributorName: [this.productModel.distributorName, [Validators.required]],
      capacity: [this.productModel.capacity],
      details: [this.productModel.details],
      uploadImg: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]
    });

  }

  onProductTypeChange(event) {
    const gstPercentage: number = this.productCategoryModelsMap.get(event.value)?.gstPercentage;
    this.gstPercentageControl.setValue(gstPercentage);

    const amount: number = this.productForm.get("rate")?.value;
    let totalAmount: number = this.getPriceWithGST(amount, gstPercentage);
    this.rateWithGSTControl.setValue(totalAmount);

    const price: number = this.productForm.get("price")?.value;
    let totalPriceAmount: number = this.getPriceWithGST(price, gstPercentage);
    this.priceWithGSTControl.setValue(totalPriceAmount);
  }

  onPriceChange(control: FormControl, event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    const gstPercentage: number = this.gstPercentageControl.value;
    let totalAmount: number = this.getPriceWithGST(amount, gstPercentage);
    control.setValue(totalAmount);
  }

  onPriceWithGSTChange(fieldName: string, event) {
    const totalAmount: number = parseFloat((event.target as HTMLInputElement).value);
    const gstPercentage: number = this.gstPercentageControl.value;
    let amount: number = this.getPriceWithoutGST(totalAmount, gstPercentage);
    this.productForm.get(fieldName)?.setValue(amount);

  }

  getPriceWithGST(amount: number, gstPercentage: number) {
    let cgstAmt = parseFloat(((amount * gstPercentage) / 200).toFixed(2));
    return amount + cgstAmt + cgstAmt;
  }

  getPriceWithoutGST(totalAmount: number, gstPercentage: number) {
    // Remove GST: GST Amount = Original Cost – (Original Cost * (100 / (100 + GST% ) ) )
    let cgstAmt: number = parseFloat(((totalAmount - (totalAmount * (100 / (100 + gstPercentage)))) / 2).toFixed(2));
    let amount: number = parseFloat((totalAmount - (cgstAmt + cgstAmt)).toFixed(2));
    return amount;
  }

  onSubmit() {
    // this.spinnerButtonOptions.active = true;
    const product: ProductModel = new ProductModel(this.productForm.value);
    if (this.action == 'edit') {
      product.id = this.productModel.id;

      if (this.productForm.value.uploadImg) {
        let uploadImageData = new FormData();
        const file = this.productForm.value.uploadImg.files[0];
        uploadImageData.append("file", file);
        uploadImageData.append("productId", product.id + "");

        this.productService.uploadProductsImage(uploadImageData).subscribe(
          (response) => {
            product.uploadImg = response.fileDownloadUri;
            this.updateProduct(product);
          }
        );

      } else {
        product.uploadImg = this.productModel.uploadImg;
        this.updateProduct(product);
      }
    } else {
      this.productService.addNewProduct(product).pipe(first()).subscribe((productData) => {
        if (this.productForm.value.uploadImg) {
          let uploadImageData = new FormData();
          const file = this.productForm.value.uploadImg.files[0];
          uploadImageData.append("file", file);
          uploadImageData.append("productId", productData.id + "");
          this.productService.uploadProductsImage(uploadImageData).subscribe(
            (response) => {
              productData.uploadImg = response.fileDownloadUri;
              this.productService.addNewProduct(productData).subscribe(
                (data) => {
                  this.router.navigate(['pages/products/all-products']);
                });
            }
          );

        } else {
          this.router.navigate(['pages/products/all-products']);
        }
      });
    }

  }

  updateProduct(product) {
    this.productService.addNewProduct(product).subscribe((data) => {
      this.router.navigate(['pages/products/all-products']);
    });
  }
}
