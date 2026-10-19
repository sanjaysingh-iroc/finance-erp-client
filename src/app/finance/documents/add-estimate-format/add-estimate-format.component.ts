import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { CompanyService } from '../../../company-settings/company.service';
import { first, map, startWith } from 'rxjs/operators';
import { CompanyModel } from '../../../company-settings/company.model';
import { settings } from '../../../demo/data';
import { BrandModel, ProductBrandModel, ProductCategoryModel, StateModel } from '../../../shared/common.models';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductService } from '../../products/product.service';
import { ProductModel } from '../../products/product.model';
import { Utils } from '../../../shared/util-class';
import { Observable } from 'rxjs';
import { LoginModel } from '../../../auth/login-model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { DocumentService } from '../document.service';
import { SolarEstimateModel } from '../document.model';
import { Router } from '@angular/router';
import { DocumentPdfService } from '../document-pdf.service';
import { SolarCustomerModel } from '../../solar/solar-billing.model';
import { SolarService } from '../../solar/solar.service';

@Component({
  selector: 'app-add-estimate-format',
  templateUrl: './add-estimate-format.component.html',
  styleUrls: ['./add-estimate-format.component.sass']
})

export class AddEstimateFormatComponent implements OnInit {

  customerForm: FormGroup;
  productForm: FormGroup;

  spinnerButtonOptions: MatProgressButtonOptions;

  currency = settings.CURRENCY;

  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();
  stateMap: Map<number, StateModel> = new Map<number, StateModel>();

  solarProductList: ProductBrandModel[] = [];
  solarProductMap: Map<number, string> = new Map<number, string>();

  inverterProductList: ProductBrandModel[] = [];
  inverterProductMap: Map<number, string> = new Map<number, string>();

  productsMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  installationProduct: ProductModel;

  customerDetails = new FormControl(null, [
    Validators.required,
    this.forbiddenNamesValidator()
  ]);
  filteredOptions: Observable<SolarCustomerModel[]>;
  selectedCustomer: SolarCustomerModel = new SolarCustomerModel({}, {});
  customerModelMap: Map<number, SolarCustomerModel> = new Map<number, SolarCustomerModel>();
  customers: SolarCustomerModel[] = [];
  login: LoginModel;

  solarEstimateModel: SolarEstimateModel;
  action: string;
  dialogTitle: string = 'Add';
  companyModel: CompanyModel;
  amountInWords: string[] = [];

  constructor(private fb: FormBuilder,
    private commonLayout: CommonLayout,
    private pdfService: PdfService,
    private companyService: CompanyService,
    private utilsService: UtilsService,
    private productService: ProductService,
    private solarBillingService: SolarService,
    private documentService: DocumentService,
    private localStorageData: LocalStorageData,
    private router: Router,
    private documentPdfService: DocumentPdfService,

    public utils: Utils,
  ) { }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;
    this.action = history.state.action;
    if (this.action == 'edit' || this.action == 'view') {
      this.solarEstimateModel = history.state.solarEstimateModel;
      this.dialogTitle = 'Edit';
    } else {
      this.solarEstimateModel = new SolarEstimateModel({ estimateDate: new Date }, { gst: 5 });
    }

    const gstPercentage: number = this.solarEstimateModel.gst;
    const amount: number = this.solarEstimateModel.amount;
    let gstAmt = parseFloat(((amount * gstPercentage) / 100).toFixed(2));
    const amountWithGst = amount + gstAmt;

    this.utilsService.getStates(1).subscribe(data => data.forEach(state => this.stateMap.set(state.id, state)));

    this.solarBillingService.getAllActiveSolarCustomers(this.login.companyId, false).subscribe(data => {
      this.customerDetails.reset(null);
      this.customers = [];
      data.forEach(customer => {
        if (customer.active) {
          this.customerModelMap.set(customer.id, customer);
          this.customers.push(customer);
        }
      });

      this.customers.sort((a, b) => a.name.localeCompare(b.name));
      this.filteredOptions = this.customerDetails.valueChanges.pipe(
        startWith<any>({ id: 0, name: "" }),
        map(value => (value == null || typeof value == "string" ? value : value.name)),
        map(name => (name ? this._filter(name) : this.customers.slice()))
      );

    });

    this.utilsService.getBrandDetails().subscribe(data => {
      data.forEach(brand => {
        this.brandMap.set(brand.id, brand);
      });

      this.productService.getAllProducts(this.login.companyId).subscribe(data => {
        data.forEach(product => {

          if (product.productType == 10) {
            this.solarProductMap.set(product.id, this.brandMap.get(product.brandId)?.name + '-' + product.modelNo);
            this.productsMap.set(product.id, product);
            this.solarProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          } else if (product.productType == 11 || product.productType == 12) {
            this.productsMap.set(product.id, product);
            this.inverterProductMap.set(product.id, this.brandMap.get(product.brandId)?.name + '-' + product.modelNo);
            this.inverterProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          } else if (product.productType == 18) {

            this.installationProduct = product;
          }
        });
      });

    });

    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.customerForm = this.fb.group({
      customerName: [this.solarEstimateModel.customerName, [Validators.required]],
      serialNo: [this.solarEstimateModel.serialNo, [Validators.required]],
      estimateDate: [this.solarEstimateModel.estimateDate, Validators.required],
      address: [this.solarEstimateModel.address, [Validators.required]],
      district: [this.solarEstimateModel.district, [Validators.required]],
      pinCode: [this.solarEstimateModel.pinCode, [Validators.required]],
    });

    this.productForm = this.fb.group({
      capacity: [this.solarEstimateModel.capacity, [Validators.required]],
      amount: [this.solarEstimateModel.amount, [Validators.required]],
      priceWithGST: [amountWithGst, [Validators.required]],

      gst: [this.solarEstimateModel.gst, [Validators.required]],
      solarModelId: [this.solarEstimateModel.solarModelId, Validators.required],
      solarQuantity: [this.solarEstimateModel.solarQuantity, [Validators.required, Validators.min(1)]],
      inverterModelId: [this.solarEstimateModel.inverterModelId, [Validators.required]],
    });

    this.documentService.getLatestSolarEstimate(this.login.companyId).subscribe(data => {
      if (this.action != 'edit' && this.action != 'view') {
        const invoiceSerial = data ? data.serialNo : 0;
        this.customerForm.get('serialNo').setValue(invoiceSerial + 1);
      }
    });

    this.companyService.getCompanyDetails(this.login.companyId).pipe(first()).subscribe(companyModel => {
      if (companyModel == undefined) {
        companyModel = new CompanyModel({});
      }

      this.companyModel = companyModel;
      this.customerForm.get('district').setValue(companyModel.district);
      this.customerForm.get('pinCode').setValue(companyModel.pinCode);
    });
  }

  forbiddenNamesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (typeof control.value == 'string') {
        return { forbiddenNames: { value: control.value } };
      }
      return null;
    };
  }

  displayFn(user: any): string {
    return user ? user.name : '';
  }

  getCustomer(value) {
    this.selectedCustomer = value;

    this.customerForm.get('customerName').setValue(this.selectedCustomer.name);
    this.customerForm.get('address').setValue(this.selectedCustomer.address);
    this.customerForm.get('district').setValue(this.selectedCustomer.district);
    this.customerForm.get('pinCode').setValue(this.selectedCustomer.pinCode);

    this.productForm.get('capacity').setValue(this.selectedCustomer.capacity);
    this.productForm.get('priceWithGST').setValue(this.selectedCustomer.price);
    this.productForm.get('solarModelId').setValue(this.selectedCustomer.solarProductId);
    this.productForm.get('inverterModelId').setValue(this.selectedCustomer.inverterProductId);

    this.totalPriceChange(this.selectedCustomer.price);

  }

  private _filter(name: string): SolarCustomerModel[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      option => option.name.toLowerCase().indexOf(filterValue) == 0
    );
  }


  onGstChange(event) {
    const gstPercentage: number = parseFloat((event.target as HTMLInputElement).value);
    const amount: number = parseFloat(this.productForm.get("amount")?.value);
    let gstAmt = parseFloat(((amount * gstPercentage) / 100).toFixed(2));
    this.productForm.get('priceWithGST')?.setValue(amount + gstAmt);
  }

  onPriceChange(event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    const gstPercentage: number = this.productForm.get("gst")?.value;
    let gstAmt = parseFloat(((amount * gstPercentage) / 100).toFixed(2));
    this.productForm.get('priceWithGST')?.setValue(amount + gstAmt);
    this.amountInWords[0] = this.utils.convertToWords(amount);
    this.amountInWords[1] = this.utils.convertToWords(amount + gstAmt);

  }

  onTotalPriceChange(event) {
    // Remove GST: GST Amount = Original Cost – (Original Cost * (100 / (100 + GST% ) ) )
    const totalAmount: number = parseFloat((event.target as HTMLInputElement).value);
    this.totalPriceChange(totalAmount);
  }

  totalPriceChange(totalAmount) {
    const gstPercentage: number = parseFloat(this.productForm.get("gst")?.value);
    const amount = parseFloat((totalAmount * (100 / (100 + gstPercentage))).toFixed(2));

    this.productForm.get('amount')?.setValue(amount);

    this.amountInWords[0] = this.utils.convertToWords(amount);
    this.amountInWords[1] = this.utils.convertToWords(totalAmount);
  }

  onSubmit() {
    const solarEstimateModel = new SolarEstimateModel(this.customerForm.value, this.productForm.value);
    if (this.action == 'edit') {
      solarEstimateModel.id = this.solarEstimateModel.id;
    }
    solarEstimateModel.companyId = this.login.companyId;

    if (this.action == 'view') {
      const header = this.documentPdfService.createEstimateHeader(this.companyModel, this.stateMap);
      this.pdfService.generateEstimatePDF(this.companyModel, this.documentPdfService.getEstimatePDFData(solarEstimateModel, this.companyModel, this.productsMap, this.brandMap, this.installationProduct), header, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', 'open');
    } else {
      this.documentService.addNewSolarEstimate(solarEstimateModel).pipe(first()).subscribe(data => {
        const header = this.documentPdfService.createEstimateHeader(this.companyModel, this.stateMap);
        this.pdfService.generateEstimatePDF(this.companyModel, this.documentPdfService.getEstimatePDFData(solarEstimateModel, this.companyModel, this.productsMap, this.brandMap, this.installationProduct), header, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', 'open');
        this.router.navigate(['billing/finance/documents/all-estimate-format']);
      });
    }
  }

}
