import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { CompanyService } from '../../../company-settings/company.service';
import { first, map, startWith } from 'rxjs/operators';
import { CompanyModel } from '../../../company-settings/company.model';
import { settings } from '../../../demo/data';
import { BrandModel, ProductBrandModel, StateModel } from '../../../shared/common.models';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductService } from '../../products/product.service';
import { ProductModel } from '../../products/product.model';
import { Utils } from '../../../shared/util-class';
import { CompressImageService } from '../../../shared/services/CompressImageService';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { LoginModel } from '../../../auth/login-model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { SolarAgreementModel } from '../document.model';
import { DocumentService } from '../document.service';
import { Router } from '@angular/router';
import { DocumentPdfService } from '../document-pdf.service';
import { SolarCustomerModel } from '../../solar/solar-billing.model';
import { SolarService } from '../../solar/solar.service';

@Component({
  selector: 'app-add-solar-agreement-format',
  templateUrl: './add-solar-agreement-format.component.html',
  styleUrls: ['./add-solar-agreement-format.component.sass']
})

export class AddSolarAgreementFormatComponent implements OnInit {
  apiURL: string = environment.apiUrl;
  customerForm: FormGroup;
  spinnerButtonOptions: MatProgressButtonOptions;
  // companyMap: Map<number, CompanyModel> = new Map<number, CompanyModel>();

  currency = settings.CURRENCY_IN_WORD;

  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();
  stateMap: Map<number, StateModel> = new Map<number, StateModel>();

  solarProductList: ProductBrandModel[] = [];
  solarProductMap: Map<number, string> = new Map<number, string>();

  inverterProductList: ProductBrandModel[] = [];
  inverterProductMap: Map<number, string> = new Map<number, string>();

  productsMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  installationProduct: ProductModel;
  companyModel: CompanyModel;

  fileToUpload: any;
  imageUrl: any;

  customerDetails = new FormControl(null, [
    Validators.required,
    this.forbiddenNamesValidator()
  ]);
  filteredOptions: Observable<SolarCustomerModel[]>;
  selectedCustomer: SolarCustomerModel = new SolarCustomerModel({}, {});
  customerModelMap: Map<number, SolarCustomerModel> = new Map<number, SolarCustomerModel>();
  customers: SolarCustomerModel[] = [];
  login: LoginModel;

  solarAgreementModel: SolarAgreementModel;
  action: string;
  dialogTitle: string = 'Add';
  amountInWords: string;

  constructor(private fb: FormBuilder,
    private commonLayout: CommonLayout,
    private pdfService: PdfService,
    private companyService: CompanyService,
    private utilsService: UtilsService,
    private productService: ProductService,
    private compressImage: CompressImageService,
    private solarBillingService: SolarService,
    private localStorageData: LocalStorageData,
    private documentService: DocumentService,
    private documentPdfService: DocumentPdfService,

    private router: Router,
    public utils: Utils,
  ) { }

  ngOnInit(): void {
    this.utilsService.getStates(1).subscribe(data => data.forEach(state => this.stateMap.set(state.id, state)));
    this.login = this.localStorageData.userValue;
    this.action = history.state.action;
    if (this.action == 'edit' || this.action == 'view') {
      this.solarAgreementModel = history.state.solarAgreementModel;
      this.dialogTitle = 'Edit';
    } else {
      this.solarAgreementModel = new SolarAgreementModel({ agreementDate: new Date });
    }

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
      name: [''],
      meterNumber: ['', [Validators.required]],
      electricityBoard: ['Dakshinanchal Vidyut Vitran Nigam Limited ', [Validators.required]],
      address: [''],
      district: ['', [Validators.required]],
      pinCode: ['', [Validators.required]],
      signImg: [undefined, [this.compressImage.fileMaxSize(2 * 1024 * 1024)]],

      agreementDate: [this.solarAgreementModel.agreementDate, Validators.required],
      capacity: [this.solarAgreementModel.capacity, [Validators.required]],
      amount: [this.solarAgreementModel.amount, [Validators.required]],
      solarModelId: [this.solarAgreementModel.solarModelId, Validators.required],
      inverterModelId: [this.solarAgreementModel.inverterModelId, [Validators.required]],
    });

    this.solarBillingService.getAllActiveSolarCustomers(this.login.companyId, false).subscribe(data => {
      this.customerDetails.reset(null);
      this.customers = [];
      data.forEach(customer => {
        this.customerModelMap.set(customer.id, customer);
        this.customers.push(customer);
      });

      this.customers.sort((a, b) => a.name.localeCompare(b.name));
      this.filteredOptions = this.customerDetails.valueChanges.pipe(
        startWith<any>({ id: 0, name: "" }),
        map(value => (value == null || typeof value == "string" ? value : value.name)),
        map(name => (name ? this._filter(name) : this.customers.slice()))
      );

      if (this.action == 'edit') {
        this.selectedCustomer = this.customerModelMap.get(this.solarAgreementModel.customerId);
        this.customerDetails.setValue({ name: this.selectedCustomer.name });
        this.getCustomer(this.selectedCustomer);

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

  convertAmtInWords(event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    this.amountInWords = this.utils.convertToWords(amount);
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

    this.customerForm.get('name').setValue(this.selectedCustomer.name);
    this.customerForm.get('address').setValue(this.selectedCustomer.address);
    this.customerForm.get('district').setValue(this.selectedCustomer.district);
    this.customerForm.get('pinCode').setValue(this.selectedCustomer.pinCode);
    this.customerForm.get('meterNumber').setValue(this.selectedCustomer.electricityMeterNo);
    this.customerForm.get('amount').setValue(this.selectedCustomer.price);
    this.amountInWords = this.utils.convertToWords(this.selectedCustomer.price);

    this.customerForm.get('capacity').setValue(this.selectedCustomer.capacity);

    this.customerForm.get('solarModelId').setValue(this.selectedCustomer.solarProductId);
    this.customerForm.get('inverterModelId').setValue(this.selectedCustomer.inverterProductId);
  }

  private _filter(name: string): SolarCustomerModel[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      option => option.name.toLowerCase().indexOf(filterValue) == 0
    );
  }

  handleFileInput(file: FileList) {
    this.spinnerButtonOptions.active = true;
    this.fileToUpload = file.item(0);

    //Show image preview
    let reader = new FileReader();
    reader.onload = (event: any) => {
      this.imageUrl = event.target.result;
      this.spinnerButtonOptions.active = false;
    }
    reader.readAsDataURL(this.fileToUpload);
  }

  updateCustomerUrl(event) {
    event.target.src = "assets/images/blank_image.png";
  }

  onSubmit() {
    const solarAgreementModel = new SolarAgreementModel(this.customerForm.value);
    if (this.action == 'edit') {
      solarAgreementModel.id = this.solarAgreementModel.id;
    }

    solarAgreementModel.companyId = this.login.companyId;
    solarAgreementModel.customerId = this.selectedCustomer.id;

    const imageUrl = this.imageUrl ? this.imageUrl : (this.selectedCustomer.uploadSign ? this.apiURL + this.selectedCustomer.uploadSign : null);
    const electricityBoard = this.customerForm.get("electricityBoard")?.value;

    if (this.action == 'view') {
      const header = {

      };

      this.pdfService.generateCustomPDF(this.companyModel, this.documentPdfService.getSolarAgreementPDFData(solarAgreementModel, electricityBoard, this.productsMap, this.selectedCustomer, this.companyModel, this.brandMap), header, {}, [55, 40, 40, 75], {}, imageUrl, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', 'open');
    } else {

      this.documentService.addNewSolarAgreement(solarAgreementModel).pipe(first()).subscribe(data => {
        const header = {

        };
        this.pdfService.generateCustomPDF(this.companyModel, this.documentPdfService.getSolarAgreementPDFData(solarAgreementModel, electricityBoard, this.productsMap, this.selectedCustomer, this.companyModel, this.brandMap), header, {}, [55, 40, 40, 75], {}, imageUrl, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', 'open');

        this.router.navigate(['billing/finance/documents/all-solar-agreement-format']);
      });
    }
  }




}
