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
import { formatDate } from '@angular/common';
import { settings } from '../../../demo/data';
import { SolarCustomerModel } from '../../solar/solar-billing.model';
import { SolarService } from '../../solar/solar.service';

@Component({
  selector: 'app-add-work-completion-letter',
  templateUrl: './add-work-completion-letter.component.html',
  styleUrls: ['./add-work-completion-letter.component.sass']
})

export class AddWorkCompletionLetterComponent implements OnInit {
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
    const imageUrl = (this.selectedCustomer.uploadSign ? this.apiURL + this.selectedCustomer.uploadSign : null);

    this.pdfService.generateCustomPDF(this.companyModel, this.getPDFData(), header, {}, [55, 50, 40, 75], {}, imageUrl, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', 'open');
  }

  private getPDFData() {
    const agreementDate = this.customerForm.get('agreementDate')?.value;
    return [
      { text: 'WORK COMPLETION REPORT/CERTIFICATE OF RTS PLANT TO BANK FOR THE INSPECTION AND DISBURSEMENT OF THE REST AMOUNT', alignment: 'center', fontSize: 14, bold: true, decoration: 'underline', },
      '\n',
      {
        fontSize: 10,
        stack: [
          { text: 'To,' },
          { text: 'Branch Manager' },
          { text: this.selectedCustomer.bankName, bold: true },
          { text: ['IFSC - ', this.selectedCustomer.bankIfsc] },
          { text: ['Consumer Name - ', { text: this.selectedCustomer.name, bold: true }] },
        ]
      },
      '\n',
      { text: ['Loan for PM Surya ghar yojna in ', { text: this.selectedCustomer.capacity, bold: true }, ' KW'], alignment: 'left', fontSize: 10 },
      '\n',
      { text: ['RSPV System peak capacity[KWP]: ', { text: this.selectedCustomer.capacity, bold: true }, ' kwp'], alignment: 'left', fontSize: 10 },
      '\n',
      { text: 'Tariff Category: LMV 1', alignment: 'left', fontSize: 10 },
      '\n',
      { text: 'Respected Sir/Madam,' },
      { text: ['                This is certify that ', { text: this.companyModel.companyName, bold: true }, ' having GST No.- ', { text: this.companyModel.gstNo, bold: true }, ' has successfully completed the RTS installation project on date ', { text: formatDate(agreementDate, settings.SHOW_DATE_FORMAT, 'en'), bold: true }, ' for above mention consumer at NAME- ', { text: this.selectedCustomer.name, bold: true }, ' of ', this.selectedCustomer.capacity, ' KW Solar roof top solar plant with all supply and erection work defined in the scope of work for CFA based project/ Non-CFA based project within targeted time period with installing net meter. '], preserveLeadingSpaces: true },
      '\n\n',
      {
        columns: [
          {
            fontSize: 11,
            alignment: 'right',
            stack: [
              { text: 'Yours sincerely,', alignment: 'left' },
              '\n\n\n\n',
              { width: 60, text: ['Signing Authority Name : ', { text: this.companyModel.companyPersonName, bold: true }], alignment: 'left' },
            ]
          },
          {
            fontSize: 11,
            alignment: 'right',
            stack: [
              { text: 'Consumer Signature', alignment: 'left' },
              {
                image: 'customerSign',
                width: 100,
                height: 60,
                alignment: 'left',
              },
              { width: 60, text: ['Consumer Name : ', { text: this.selectedCustomer.name, bold: true }], alignment: 'left' },
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
