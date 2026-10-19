import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { CompanyService } from '../../../company-settings/company.service';
import { first } from 'rxjs/operators';
import { CompanyModel } from '../../../company-settings/company.model';
import { settings } from '../../../demo/data';
import { formatDate } from '@angular/common';
import { BrandModel, ProductBrandModel, ProductCategoryModel, StateModel } from '../../../shared/common.models';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductService } from '../../products/product.service';
import { ProductModel } from '../../products/product.model';
import { LoginModel } from '../../../auth/login-model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { CashReceiptModel, SolarProposalModel } from '../document.model';
import { DocumentService } from '../document.service';
import { Router } from '@angular/router';
import { Utils } from '../../../shared/util-class';
import { DocumentPdfService } from '../document-pdf.service';

@Component({
  selector: 'app-add-proposal-format',
  templateUrl: './add-proposal-format.component.html',
  styleUrls: ['./add-proposal-format.component.sass']
})

export class AddProposalFormatComponent implements OnInit {

  customerForm: FormGroup;
  productForm: FormGroup;

  spinnerButtonOptions: MatProgressButtonOptions;
  company: CompanyModel;
  currency = settings.CURRENCY;
  productCategoryModelMap: Map<number, ProductCategoryModel> = new Map<number, ProductCategoryModel>();

  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();

  productList: ProductModel[] = [];
  stateMap: Map<number, StateModel> = new Map<number, StateModel>();
  login: LoginModel;
  solarProposalModel: SolarProposalModel;
  action: string;
  dialogTitle: string = 'Add';

  inverterProductList: ProductBrandModel[] = [];
  batteryProductList: ProductBrandModel[] = [];

  solarProductMap: Map<number, string> = new Map<number, string>();
  batteryProductMap: Map<number, string> = new Map<number, string>();

  productsMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  solarProductList: ProductBrandModel[] = [];
  inverterProductMap: Map<number, string> = new Map<number, string>();
  previousInvoiceName: string = "1";
  amountInWords: string[] = [];

  constructor(private fb: FormBuilder,
    private commonLayout: CommonLayout,
    private pdfService: PdfService,
    private companyService: CompanyService,
    private utilsService: UtilsService,
    private productService: ProductService,
    private documentService: DocumentService,
    private localStorageData: LocalStorageData,
    private documentPdfService: DocumentPdfService,
    public utils: Utils,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;

    this.action = history.state.action;
    if (this.action == 'edit' || this.action == 'view') {
      this.solarProposalModel = history.state.solarProposalModel;
      this.dialogTitle = 'Edit';
    } else {
      this.solarProposalModel = new SolarProposalModel({ purchaseDate: new Date }, { gst: 5 });
    }

    this.utilsService.getStates(1).subscribe(data => data.forEach(state => this.stateMap.set(state.id, state)));

    this.spinnerButtonOptions = this.commonLayout.getprogressButton();

    const gstPercentage: number = this.solarProposalModel.gst;
    const amount: number = this.solarProposalModel.amount;
    let gstAmt = parseFloat(((amount * gstPercentage) / 100).toFixed(2));
    const amountWithGst = amount + gstAmt;

    this.customerForm = this.fb.group({
      customerName: [this.solarProposalModel.customerName, [Validators.required]],
      serialNo: [this.solarProposalModel.serialNo, [Validators.required]],
      proposalDate: [new Date, Validators.required],
      address: [this.solarProposalModel.address, [Validators.required]],
      district: [this.solarProposalModel.district, [Validators.required]],
      pinCode: [this.solarProposalModel.pinCode, [Validators.required]],
    });

    this.productForm = this.fb.group({
      amount: [this.solarProposalModel.amount, [Validators.required]],
      priceWithGST: [amountWithGst, [Validators.required]],

      gst: [this.solarProposalModel.gst, [Validators.required]],
      solarModelId: [this.solarProposalModel.solarModelId, Validators.required],
      capacity: [this.solarProposalModel.capacity, [Validators.required]],

      solarQuantity: [this.solarProposalModel.solarQuantity, [Validators.required, Validators.min(1)]],
      inverterModelId: [this.solarProposalModel.inverterModelId, [Validators.required]],
      inverterCapacity: [this.solarProposalModel.inverterCapacity, [Validators.required]],
      batteryQuantity: [this.solarProposalModel.batteryQuantity],
      batteryModelId: [this.solarProposalModel.batteryModelId],
    });

    this.companyService.getCompanyDetails(this.login.companyId).pipe(first()).subscribe(companyModel => {
      if (companyModel == undefined) {
        companyModel = new CompanyModel({});
      }
      this.company = companyModel;
      this.customerForm.get('district').setValue(companyModel.district);
      this.customerForm.get('pinCode').setValue(companyModel.pinCode);

    });

    this.documentService.getLatestSolarProposal(this.login.companyId).subscribe(data => {
      if (this.action != 'edit' && this.action != 'view') {
        const invoiceSerial = data ? data.serialNo : 0;
        this.customerForm.get('serialNo').setValue(invoiceSerial + 1);
      }
    });

    this.utilsService.getAllProductCategory().subscribe(data => {
      data.forEach(product => {
        this.productCategoryModelMap.set(product.id, product);
      });
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
          } else if (product.productType == 4) {
            this.productsMap.set(product.id, product);
            this.batteryProductMap.set(product.id, this.brandMap.get(product.brandId)?.name + '-' + product.modelNo);
            this.batteryProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo + '-' + product.capacity
            });
          }
        });
      });

    });

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
    const gstPercentage: number = parseFloat(this.productForm.get("gst")?.value);
    const amount = (totalAmount * (100 / (100 + gstPercentage)));

    this.productForm.get('amount')?.setValue(amount.toFixed(2));
    this.amountInWords[0] = this.utils.convertToWords(amount);
    this.amountInWords[1] = this.utils.convertToWords(totalAmount);
  }

  onSubmit() {
    const solarProposalModel = new SolarProposalModel(this.customerForm.value, this.productForm.value);
    if (this.action == 'edit') {
      solarProposalModel.id = this.solarProposalModel.id;
    }

    solarProposalModel.companyId = this.login.companyId;

    if (this.action == 'view') {
      this.generatePDF(solarProposalModel);
    } else {
      this.documentService.addNewSolarProposal(solarProposalModel).pipe(first()).subscribe(data => {
        this.generatePDF(data);
        this.router.navigate(['billing/finance/documents/all-proposal-format']);
      });
    }
  }

  generatePDF(solarProposalModel: SolarProposalModel, action = 'open') {
    const proposalData = this.documentPdfService.getProposalData(solarProposalModel, this.brandMap, this.productsMap, this.productCategoryModelMap, this.company, this.stateMap);
    this.pdfService.generateProposalPDF(this.company, proposalData, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', action);
  }


}
