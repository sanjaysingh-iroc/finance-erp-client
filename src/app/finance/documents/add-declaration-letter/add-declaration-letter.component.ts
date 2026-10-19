import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { CompanyService } from '../../../company-settings/company.service';
import { first, map, startWith } from 'rxjs/operators';
import { CompanyModel } from '../../../company-settings/company.model';
import { settings } from '../../../demo/data';
import { formatDate } from '@angular/common';
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
  selector: 'app-add-declaration-letter',
  templateUrl: './add-declaration-letter.component.html',
  styleUrls: ['./add-declaration-letter.component.sass']
})

export class AddDeclarationLetterComponent implements OnInit {
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
    this.selectedCustomer.uploadSign = "assets/images/blank_image.png";
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
      name: [''],
      meterNumber: ['', [Validators.required]],
      address: [''],
      district: ['', [Validators.required]],
      pinCode: ['', [Validators.required]],

      agreementDate: [new Date, Validators.required],
      capacity: [0, [Validators.required]],
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
    this.isImage = true;
    this.selectedCustomer = value;

    this.customerForm.get('name').setValue(this.selectedCustomer.name);
    this.customerForm.get('address').setValue(this.selectedCustomer.address);
    this.customerForm.get('district').setValue(this.selectedCustomer.district);
    this.customerForm.get('pinCode').setValue(this.selectedCustomer.pinCode);
    this.customerForm.get('meterNumber').setValue(this.selectedCustomer.electricityMeterNo);
    this.customerForm.get('capacity').setValue(this.selectedCustomer.capacity);
  }

  private _filter(name: string): SolarCustomerModel[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      option => option.name.toLowerCase().indexOf(filterValue) == 0
    );
  }

  updateCustomerUrl(event) {
    this.isImage = false;
    event.target.src = "assets/images/blank_image.png";
  }

  isImage = true;

  onSubmit() {
    const customerSign = this.selectedCustomer.uploadSign && this.isImage ? this.apiURL + this.selectedCustomer.uploadSign : "assets/images/blank_image.png";
    const header = this.createHeader();
    this.pdfService.generateCustomPDF(this.companyModel, this.getPDFData(), header, {}, [55, 100, 40, 75], {}, customerSign, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', 'open');
  }

  private getPDFData() {
    const panelDescription = this.createPanelDescription();
    const inverterDescription = this.createInverterDescription();
    const agreementDate = this.customerForm.get('agreementDate')?.value;
    return [
      { text: 'Annexure-I', alignment: 'right', fontSize: 14, bold: true },
      '\n',
      { text: 'Declaration Format', alignment: 'center', bold: true },
      { text: 'Declaration by Empanelled Vendor', alignment: 'center', bold: true },
      '\n',
      { text: 'Dated:- ' + formatDate(agreementDate, settings.SHOW_DATE_FORMAT, 'en'), alignment: 'right' },
      '\n',
      {
        fontSize: 10,
        stack: [
          { text: 'To,' },
          { text: 'Mission Director' },
          { text: 'PM Surya Ghar: Muft Bijli Yojana' },
          { text: 'Ministry of New and Renewable Energy' },
          { text: 'Atal Akshay Urja Bhawan' },
          { text: 'Lodi Road, New Delhi 110003' },
        ]
      },
      '\n',
      { text: 'Subject: Declaration Regarding Non-Usage of Solar Module/ Inverter Serial Numbers Elsewhere', alignment: 'left', bold: true, fontSize: 10 },
      '\n',
      { text: 'Reference: [PM Surya Ghar Application- Duplicate/Repeted Serial Number]', fontSize: 10, alignment: 'left' },
      '\n',

      {
        fontSize: 12,
        stack: [
          { text: 'Sir/Madam,' },
          {
            ol: [
              {
                margin: [0, 10, 0, 0],
                text: [
                  { text: 'I, the undersigned, ' },
                  { text: this.companyModel.companyName, bold: true },
                  { text: ' , having our registered office at ' },
                  { text: this.companyModel.address, bold: true },
                  { text: ', ', bold: true },
                  { text: this.companyModel.district, bold: true },
                  { text: '-' },
                  { text: this.companyModel.pinCode, bold: true },
                  { text: ' , hereby declare and confirm the following:' },

                ]
              },
              {
                margin: [0, 10, 0, 0],
                text: [
                  { text: 'The solar modules & Inverter supplied by us under PM Surya Ghar Muft Bijli Yojana for application number ' },
                  { text: this.selectedCustomer.applicationNumber, bold: true },
                  { text: ' for the consumer ' },
                  { text: this.selectedCustomer.name, bold: true },
                  { text: ' and consumer electricity number ' },
                  { text: this.selectedCustomer.electricityMeterNo, bold: true },
                  { text: ' are new and unused.' },

                ]
              },
              {
                stack: [
                  { margin: [0, 10, 0, 0], text: ['The serial numbers of the solar modules/ inverters, which the portal indicates as repeated, as listed below, have not been used in any other project, supply, or installation previously. They are provided below in the exact format as recorded in the National Portal for PMSG:MBY.', { text: ' (Please fill either tables in para 3.A or Tables in para 3.B whichever applicable)', italics: true, fontSize: 9 }] },
                  {
                    type: 'upper-alpha',
                    ol: [
                      { margin: [0, 10, 0, 0], text: ' The serial numbers entered in Surya Ghar portal are matching with the actual module serial numbers at site, which are as follows: ', bold: true },
                      {
                        type: 'lower-roman',
                        ol: [
                          {
                            stack: [
                              { margin: [0, 10, 0, 0], text: 'List of Solar Module Serial Numbers (All the SPV modules are DCR compliant as per scheme norms): ' },
                              {
                                margin: [0, 20, 0, 20],
                                stack: [
                                  {
                                    alignment: 'center',
                                    fontSize: 10,
                                    table: {
                                      widths: ['5%', '25%', '35%', '35%'],
                                      body: panelDescription
                                    }
                                  },
                                ]
                              },

                            ]
                          },
                          {
                            stack: [
                              { text: 'List of Solar Inverter Serial Number/s', alignment: 'justify' },
                              {
                                margin: [0, 20, 0, 20],
                                stack: [
                                  {
                                    alignment: 'center',
                                    fontSize: 10,
                                    table: {
                                      widths: ['5%', '25%', '35%', '35%'],
                                      body: inverterDescription
                                    }
                                  },
                                ]
                              },

                            ]
                          },
                        ]
                      },

                    ]
                  },
                ]
              },

              { margin: [0, 10, 0, 0], text: 'I understand that any discrepancy or falsification in this declaration may result in penal actions as deemed appropriate by the Ministry of New and Renewable Energy.' },
              { margin: [0, 10, 0, 0], text: 'I affirm that the information provided herein is true and correct to the best of my knowledge and belief.' },

            ]
          },

        ]
      },
      '\n',
      {
        fontSize: 11,
        stack: [
          { text: 'Yours sincerely,', alignment: 'justify' },
          '\n\n',

          {
            columns: [
              { width: 60, text: 'Signature: ', alignment: 'left' },
              {
                margin: [0, -10, 0, 0],
                image: 'customerSign',
                width: 100,
                height: 30,
                alignment: 'left',
              }
            ]
          },


          '\n',
          { text: ['Name: ', this.selectedCustomer.name], alignment: 'justify' },
          '\n',
          { text: 'Designation: PM SurYaghar: Muft Bijli Yojana', alignment: 'justify' },
          '\n',
          {
            text: [
              { text: 'Company/firm name: ' },
              { text: this.companyModel.companyName, bold: true },
            ]
          },
          '\n',
          {
            text: [
              { text: 'Address: ' },
              { text: this.companyModel.address },
              { text: ', ' },
              { text: this.companyModel.district },
              { text: '-' },
              { text: this.companyModel.pinCode },

            ]
          },
          '\n',
          // { text: 'Stamp', alignment: 'justify' },
          {
            columns: [
              { width: 60, text: 'Stamp: ', alignment: 'left' },
              {
                margin: [0, -10, 0, 0],
                image: 'signWithStampImg',
                width: 100,
                height: 50,
                alignment: 'left',
              }
            ]
          },
        ]
      },

    ];
  }

  private createPanelDescription() {
    let data = [];
    let index = 1;
    const product = this.productsMap.get(this.selectedCustomer.solarProductId);

    data.push([{ colSpan: 4, text: 'Sr. no. entered in portal', alignment: 'center' }, '', '', '']);
    data.push([{ text: 'Sr..' }, { text: 'Module capacities (Wp)' }, { text: 'Make' }, { text: 'Module Serial number' }]);

    this.selectedCustomer.solarPanelModels.forEach(panel => {

      data.push([{ text: index++ }, { text: product?.capacity }, { text: this.brandMap.get(product?.brandId)?.name }, { text: panel.panelSerial }]);

    });
    data.push([{ colSpan: 2, text: ['Total module ', this.selectedCustomer.capacity, ' Kwp capacity of the plant'] }, { text: '' }, { text: this.selectedCustomer.capacity + ' Kwp' }, { text: '------' }]);


    return data;
  }

  private createInverterDescription() {
    let data = [];
    let index = 1;
    const product = this.productsMap.get(this.selectedCustomer.inverterProductId);
    data.push([{ colSpan: 4, text: 'Sr. no. entered in portal', alignment: 'center' }, '', '', '']);
    data.push([{ text: 'Sr..' }, { text: 'Inverter capacity (in kW)' }, { text: 'Make' }, { text: 'Inverter Serial number' }]);
    data.push([{ text: index++ }, { text: product?.capacity }, { text: this.brandMap.get(product?.brandId)?.name }, { text: this.selectedCustomer.inverterSerial }]);


    return data;
  }

  private createHeader() {
    return [
      {
        margin: [20, 10, 50, 0],
        columns: [
          [
            { text: this.companyModel.companyName, fontSize: 18, alignment: 'left', bold: true },
            { text: this.companyModel.address + ',' + this.companyModel.district + '-' + this.companyModel.pinCode, fontSize: 10, alignment: 'left' },
            { text: 'Phone No.: +91-' + this.companyModel.mobile, fontSize: 10, alignment: 'left' },
            { text: 'Email: ' + this.companyModel.email, fontSize: 10, alignment: 'left' },
            { text: 'GSTIN: ' + this.companyModel.gstNo, fontSize: 10, alignment: 'left' },
            { text: 'State: ' + this.stateMap.get(this.companyModel.stateId)?.gstCode + '-' + this.stateMap.get(this.companyModel.stateId)?.name, fontSize: 10, alignment: 'left' },

          ],
          {
            image: 'logo',
            width: 100,
            height: 90,
            alignment: 'left',
            absolutePosition: { x: 470, y: 5 }
          },

        ]
      },
      // '\n',
      {
        canvas: [{ type: 'line', x1: 10, y1: 5, x2: 580, y2: 5, lineWidth: 1 }]
      }
    ];
  }
}
