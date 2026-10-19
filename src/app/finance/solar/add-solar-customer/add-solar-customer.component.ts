import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';
import { CompressImageService } from '../../../shared/services/CompressImageService';
import { forkJoin, of } from 'rxjs';
import { environment } from '@environments/environment';
import { LoginModel } from '../../../auth/login-model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { CompanyService } from '../../../company-settings/company.service';
import { CompanyModel } from '../../../company-settings/company.model';
import { UtilsService } from '../../../shared/services/utils.service';
import { BrandModel, CountryModel, ProductBrandModel, StateModel } from '../../../shared/common.models';
import { ProductService } from '../../products/product.service';
import { Utils } from '../../../shared/util-class';
import { SolarBatteryModel, SolarCustomerModel, SolarPanelModel } from '../solar-billing.model';
import { SolarService } from '../solar.service';

@Component({
  selector: 'app-add-solar-customer',
  templateUrl: './add-solar-customer.component.html',
  styleUrls: ['./add-solar-customer.component.sass']
})

export class AddSolarCustomerComponent {
  action: string;
  dialogTitle: string = 'Add';
  solarCustomerModel: SolarCustomerModel;
  customerPersonalForm: FormGroup;
  billForm: FormGroup;
  purchaseProducts = new FormArray([]);
  batteryPurchaseProducts = new FormArray([]);

  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();

  spinnerButtonOptions: MatProgressButtonOptions;
  apiURL: string = environment.apiUrl;
  login: LoginModel;
  // companyModel: CompanyModel;
  inverterProductList: ProductBrandModel[] = [];
  solarProductList: ProductBrandModel[] = [];
  solarBatteryProductList: ProductBrandModel[] = [];

  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();
  stateModels: StateModel[];
  countryModels: CountryModel[];

  amountInWords: string[] = [];

  constructor(private fb: FormBuilder,
    private solarBillingService: SolarService,
    private commonLayout: CommonLayout,
    private compressImage: CompressImageService,
    private staffService: StaffService,
    private companyService: CompanyService,
    private localStorageData: LocalStorageData,
    private utilsService: UtilsService,
    private productService: ProductService,
    public utils: Utils,

    private router: Router
  ) { }

  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.login = this.localStorageData.userValue;

    this.staffService.getAllUsers(this.login.companyId).subscribe(data => {
      data.forEach(staffModel => this.staffMap.set(staffModel.id, staffModel));
    });
    this.utilsService.getCountry().subscribe(data => {
      this.countryModels = data;
    });

    this.utilsService.getStates(1).subscribe(data => {
      this.stateModels = data;
    });

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.solarCustomerModel = history.state.solarCustomerModel;
      this.amountInWords[0] = this.utils.convertToWords(this.solarCustomerModel.price);
      this.amountInWords[1] = this.utils.convertToWords(this.solarCustomerModel.advancePrice);

      this.dialogTitle = 'Edit';
      this.solarCustomerModel.solarPanelModels.forEach(solarPanelModel => {
        this.purchaseProducts.push(this.initSectionRow(solarPanelModel.id, solarPanelModel.panelSerial));
      });

      this.solarCustomerModel.solarBatteryModels.forEach(solarPanelModel => {
        this.batteryPurchaseProducts.push(this.initBatterySectionRow(solarPanelModel.id, solarPanelModel.serialNo));
      });



    } else {
      this.solarCustomerModel = new SolarCustomerModel({}, {});
    }

    if (this.solarCustomerModel.solarPanelModels.length == 0) {
      this.purchaseProducts.push(this.initSectionRow());
    }

    // if (this.solarCustomerModel.solarBatteryModels.length == 0) {
    //   this.batteryPurchaseProducts.push(this.initBatterySectionRow());
    // }



    const result = new Date();
    result.setDate(result.getDate() + 2);

    this.utilsService.getBrandDetails().subscribe(data => {
      data.forEach(brand => {
        this.brandMap.set(brand.id, brand);
      });

      this.productService.getAllProducts(this.login.companyId).subscribe(data => {
        data.forEach(product => {

          if (product.productType == 10) {
            this.solarProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          } else if (product.productType == 11 || product.productType == 12) {
            this.inverterProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          } else if (product.productType == 4) {
            this.solarBatteryProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          }
        });
      });
    });

    console.log(this.solarCustomerModel);
    this.customerPersonalForm = this.fb.group({
      name: [this.solarCustomerModel.name, [Validators.required]],
      email: [this.solarCustomerModel.email],
      mobile: [this.solarCustomerModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      emergencyMobile: [this.solarCustomerModel.emergencyMobile, [Validators.pattern("^[0-9]{10}$")]],

      address: [this.solarCustomerModel.address, [Validators.required]],
      district: [this.solarCustomerModel.district, [Validators.required]],
      pinCode: [this.solarCustomerModel.pinCode, [Validators.required]],
      countryId: [this.solarCustomerModel.countryId, [Validators.required]],
      stateId: [this.solarCustomerModel.stateId, [Validators.required]],
      gstNo: [this.solarCustomerModel.gstNo],

      electricityMeterNo: [this.solarCustomerModel.electricityMeterNo],
      uppclPassword: [this.solarCustomerModel.uppclPassword],
      aadharNo: [this.solarCustomerModel.aadharNo],
      panNo: [this.solarCustomerModel.panNo],
      bankName: [this.solarCustomerModel.bankName],
      bankIfsc: [this.solarCustomerModel.bankIfsc],
      bankAccountNo: [this.solarCustomerModel.bankAccountNo],

      generatedBy: [this.solarCustomerModel.generatedBy, [Validators.required]],
      uploadSign: ['', [this.compressImage.fileMaxSize(10 * 1024 * 1024)]],
    });

    this.billForm = this.fb.group({
      capacity: [this.solarCustomerModel.capacity, [Validators.required, Validators.min(1)]],
      applicationNumber: [this.solarCustomerModel.applicationNumber],
      loanApplicationNumber: [this.solarCustomerModel.loanApplicationNumber],
      solarProductId: [this.solarCustomerModel.solarProductId],
      solarBatteryProductId: [this.solarCustomerModel.solarBatteryProductId],

      inverterProductId: [this.solarCustomerModel.inverterProductId],
      inverterSerial: [this.solarCustomerModel.inverterSerial],
      price: [this.solarCustomerModel.price, [Validators.required, Validators.min(1)]],
      advancePrice: [this.solarCustomerModel.advancePrice, [Validators.required, Validators.min(0)]],
      purchaseProducts: this.purchaseProducts,
      batteryPurchaseProducts: this.batteryPurchaseProducts
    });

    if (this.action != 'edit') {

      this.companyService.getCompanyDetails(this.login.companyId).pipe(first()).subscribe(companyModel => {
        if (companyModel == undefined) {
          companyModel = new CompanyModel({});
        }
        // this.companyModel = companyModel;
        this.customerPersonalForm.get('district').setValue(companyModel.district);
        this.customerPersonalForm.get('pinCode').setValue(companyModel.pinCode);
        this.customerPersonalForm.get('stateId').setValue(companyModel.stateId);
      });

    }



  }

  onPriceChange(index, event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    this.amountInWords[index] = this.utils.convertToWords(amount);
  }

  initSectionRow(id: number = 0, panelSerial: string = '') {
    return this.fb.group({
      id: new FormControl(id),
      panelSerial: new FormControl(panelSerial),

    });
  }

  initBatterySectionRow(id: number = 0, serialNo: string = '') {
    return this.fb.group({
      id: new FormControl(id),
      serialNo: new FormControl(serialNo),

    });
  }

  addNewRow() {
    this.purchaseProducts.push(this.initSectionRow());
  }

  addNewBatteryRow() {
    this.batteryPurchaseProducts.push(this.initBatterySectionRow());
  }



  removeNewRow(index) {
    this.purchaseProducts.removeAt(index);
  }

  removeBatteryRow(index) {
    this.batteryPurchaseProducts.removeAt(index);
  }

  updateCustomerUrl(event) {
    event.target.src = "assets/images/blank_image.png";
  }

  onSubmit() {
    // this.spinnerButtonOptions.active = true;
    const solarCustomerModel: SolarCustomerModel = new SolarCustomerModel(this.customerPersonalForm.value, this.billForm.value);
    solarCustomerModel.companyId = this.login.companyId;

    const solarPanelModels: SolarPanelModel[] = [];
    for (let purchaseProduct of this.billForm.get("purchaseProducts").value) {
      if (purchaseProduct.productId != 0) {
        solarPanelModels.push({
          panelSerial: purchaseProduct.panelSerial
        });
      }

    }

    const solarBatteryModels: SolarBatteryModel[] = [];
    for (let purchaseProduct of this.billForm.get("batteryPurchaseProducts").value) {
      console.log(purchaseProduct);
      if (purchaseProduct.productId != 0) {
        solarBatteryModels.push({
          serialNo: purchaseProduct.serialNo
        });
      }
    }

    solarCustomerModel.solarPanelModels = solarPanelModels;
    solarCustomerModel.solarBatteryModels = solarBatteryModels;

    if (this.action == 'edit') {
      solarCustomerModel.id = this.solarCustomerModel.id;
      this.uploadAllDoc(solarCustomerModel);
    } else {
      this.solarBillingService.addNewSolarCustomer(solarCustomerModel).pipe(first()).subscribe((customerData) => {
        this.uploadAllDoc(customerData);
      });
    }
  }

  uploadAllDoc(customerData: SolarCustomerModel) {
    const apiCalls = {
      uploadSign: this.uploadDoc(customerData.id, this.customerPersonalForm.value.uploadSign),
    };

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        customerData.uploadSign = (results as any).uploadSign.fileDownloadUri ? (results as any).uploadSign.fileDownloadUri : this.solarCustomerModel.uploadSign;

        this.solarBillingService.addNewSolarCustomer(customerData).pipe(first()).subscribe((customerData) => {
          this.router.navigate(['billing/finance/solar/all-solar-customers']);
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
      uploadImageData.append("location", "solarBilling");
      return this.utilsService.uploadFile(uploadImageData);
    } else {
      return of({});;
    }
  }

}
