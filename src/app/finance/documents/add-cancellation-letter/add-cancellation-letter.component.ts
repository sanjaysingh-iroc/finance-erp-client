import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { CompanyService } from '../../../company-settings/company.service';
import { first, map, startWith } from 'rxjs/operators';
import { CompanyModel } from '../../../company-settings/company.model';
import { BrandModel, ProductBrandModel, StateModel } from '../../../shared/common.models';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductService } from '../../products/product.service';
import { ProductModel } from '../../products/product.model';
import { Utils } from '../../../shared/util-class';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { LoginModel } from '../../../auth/login-model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { SolarCustomerModel } from '../../solar/solar-billing.model';
import { SolarService } from '../../solar/solar.service';
@Component({
  selector: 'app-add-cancellation-letter',
  templateUrl: './add-cancellation-letter.component.html',
  styleUrls: ['./add-cancellation-letter.component.sass']
})

export class AddCancellationLetterComponent implements OnInit {
  apiURL: string = environment.apiUrl;
  customerForm: FormGroup;
  spinnerButtonOptions: MatProgressButtonOptions;

  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();
  stateMap: Map<number, StateModel> = new Map<number, StateModel>();

  solarProductList: ProductBrandModel[] = [];
  inverterProductList: ProductBrandModel[] = [];

  productsMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  companyModel: CompanyModel;

  customerDetails = new FormControl(null, [
    Validators.required,
    this.forbiddenNamesValidator()
  ]);
  filteredOptions: Observable<SolarCustomerModel[]>;
  selectedCustomer: SolarCustomerModel = new SolarCustomerModel({}, {});
  customers: SolarCustomerModel[] = [];
  login: LoginModel;

  constructor(private fb: FormBuilder,
    private commonLayout: CommonLayout,
    private pdfService: PdfService,
    private companyService: CompanyService,
    private utilsService: UtilsService,
    private productService: ProductService,
    private solarBillingService: SolarService,
    private localStorageData: LocalStorageData,
    public utils: Utils,
  ) { }

  ngOnInit(): void {
    this.utilsService.getStates(1).subscribe(data => data.forEach(state => this.stateMap.set(state.id, state)));
    this.login = this.localStorageData.userValue;

    this.utilsService.getBrandDetails().subscribe(data => {
      data.forEach(brand => {
        this.brandMap.set(brand.id, brand);
      });

      this.productService.getAllProducts(this.login.companyId).subscribe(data => {
        data.forEach(product => {

          if (product.productType == 10) {
            this.productsMap.set(product.id, product);
            this.solarProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          } else if (product.productType == 11) {
            this.productsMap.set(product.id, product);
            this.inverterProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          }
        });
      });

    });

    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.customerForm = this.fb.group({
      name: ['', [Validators.required]],
      mobile: ['', [Validators.required]],
      applicationNumber: [''],
      loanApplicationNumber: [''],
      meterNumber: ['', [Validators.required]],
      address: ['', [Validators.required]],
      district: ['', [Validators.required]],
      pinCode: ['', [Validators.required]],

      reason: ['Wrong Meter number added in solar Agreement', [Validators.required]],
      agreementDate: [new Date, Validators.required],
    });

    this.solarBillingService.getAllActiveSolarCustomers(this.login.companyId, false).subscribe(data => {
      this.customerDetails.reset(null);
      this.customers = [];
      data.forEach(customer => {
        this.customers.push(customer);
      });

      this.customers.sort((a, b) => a.name.localeCompare(b.name));
      this.filteredOptions = this.customerDetails.valueChanges.pipe(
        startWith<any>({ id: 0, name: "" }),
        map(value => (value == null || typeof value == "string" ? value : value.name)),
        map(name => (name ? this._filter(name) : this.customers.slice()))
      );
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

    this.customerForm.get('name').setValue(this.selectedCustomer.name);
    this.customerForm.get('mobile').setValue(this.selectedCustomer.mobile);
    this.customerForm.get('applicationNumber').setValue(this.selectedCustomer.applicationNumber);
    this.customerForm.get('loanApplicationNumber').setValue(this.selectedCustomer.loanApplicationNumber);
    this.customerForm.get('meterNumber').setValue(this.selectedCustomer.electricityMeterNo);
    this.customerForm.get('address').setValue(this.selectedCustomer.address);
    this.customerForm.get('district').setValue(this.selectedCustomer.district);
    this.customerForm.get('pinCode').setValue(this.selectedCustomer.pinCode);
  }

  private _filter(name: string): SolarCustomerModel[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      option => option.name.toLowerCase().indexOf(filterValue) == 0
    );
  }

  updateCustomerUrl(event) {
    event.target.src = "assets/images/blank_image.png";
  }

  onSubmit() {
    const header = this.createHeader();
    this.pdfService.generateCustomPDF(this.companyModel, this.getPDFData(), header, {}, [55, 50, 40, 75], {}, null, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', 'open');
  }

  private getPDFData() {
    const reason = this.customerForm.get('reason')?.value;
    return [
      { text: 'Solar System Loan Cancellation Application', alignment: 'center', fontSize: 20, bold: true, decoration: 'underline', },
      '\n',
      {
        fontSize: 10,
        stack: [
          { text: 'To,' },
          { text: 'Branch Manager' },
          { text: this.selectedCustomer.bankName }
        ]
      },
      '\n',
      { text: 'Subject: Application for Cancellation of Solar System Loan application.', alignment: 'left', bold: true, fontSize: 10 },
      '\n',
      { text: 'Respected Sir/Madam,' },
      { text: '                I/We hereby apply for Cancellation of Solar System Loan application  on my existing electricity connection of my/our premises.', preserveLeadingSpaces: true },
      '\n\n',
      {
        fontSize: 12,
        stack: [

          {
            margin: [20, 0, 0, 0],
            fontSize: 11,
            stack: [
              { text: ['Application No.: ', { text: this.selectedCustomer.applicationNumber, bold: true }], alignment: 'justify' },
              '\n',
              { text: ['Loan Application No.: ', { text: this.selectedCustomer.loanApplicationNumber, bold: true }], alignment: 'justify' },
              '\n',
              { text: ['Name of Applicant: ', { text: this.selectedCustomer.name, bold: true }], alignment: 'justify' },
              '\n',
              { text: ['Consumer Electricity Connection No:  ', { text: this.selectedCustomer.electricityMeterNo, bold: true }], alignment: 'justify' },
              '\n',
              { text: ['Address: ', { text: this.selectedCustomer.address, bold: true }, ', ', { text: this.selectedCustomer.district, bold: true }, '-', { text: this.selectedCustomer.pinCode, bold: true }] },
              '\n',
              { text: ['Registered mobile no.: ', { text: this.selectedCustomer.mobile, bold: true }], alignment: 'justify' },
              '\n',
              { text: ['Reason for cancellation: ', { text: reason, bold: true }], alignment: 'justify' },
              '\n',
            ]
          },


        ]
      },
      '\n',
      {


        columns: [
          { width: 350, text: ' ', alignment: 'left' },
          {
            fontSize: 11,
            alignment: 'right',
            stack: [
              { text: 'Yours sincerely,', alignment: 'left' },
              '\n\n\n\n',
              { width: 60, text: 'Applicant Name & Sign', alignment: 'left' },
            ]
          },
        ]
      }
    ];
  }

  private createHeader() {
    return {

    };
  }
}
