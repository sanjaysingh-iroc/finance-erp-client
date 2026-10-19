import { formatDate } from '@angular/common';
import { settings } from '../../demo/data';


export class SolarCustomerModel {
  id: number;
  name: string;
  email: string;
  mobile: string;
  emergencyMobile: string;
  address: string;
  district: string;
  pinCode: string;
  capacity: number;
  applicationNumber: string;
  loanApplicationNumber: string;
  solarProductId: number;
  solarBatteryProductId: number;
  inverterSerial: string;
  inverterProductId: number;

  batterySerial: string;

  electricityMeterNo: string;
  uppclPassword: string;
  aadharNo: string;
  panNo: string;
  bankName: string;
  bankIfsc: string;
  bankAccountNo: string;
  price: number;
  advancePrice: number;
  generatedBy: string;
  companyId: number;
  uploadSign: string;

  countryId: number;
  stateId: number;
  gstNo: string;

  active: boolean;
  solarPanelModels: SolarPanelModel[] = [];
  solarBatteryModels: SolarBatteryModel[] = [];

  constructor(formPersonalData, billData) {
    {

      this.id = formPersonalData.id;
      this.name = formPersonalData.name || '';
      this.email = formPersonalData.email || '';
      this.mobile = formPersonalData.mobile || '';
      this.emergencyMobile = formPersonalData.emergencyMobile || '';
      this.address = formPersonalData.address || '';
      this.district = formPersonalData.district || '';
      this.pinCode = formPersonalData.pinCode || '';
      this.countryId = formPersonalData.countryId || 1;
      this.stateId = formPersonalData.stateId || 0;
      this.gstNo = formPersonalData.gstNo || '';

      this.capacity = billData.capacity || 3;
      this.applicationNumber = billData.applicationNumber || '';
      this.loanApplicationNumber = billData.loanApplicationNumber || '';
      this.solarProductId = billData.solarProductId || 0;
      this.solarBatteryProductId = billData.solarBatteryProductId || 0;
      this.inverterProductId = billData.inverterProductId || 0;
      this.inverterSerial = billData.inverterSerial || '';

      this.batterySerial = billData.batterySerial || '';

      this.electricityMeterNo = formPersonalData.electricityMeterNo || '';
      this.uppclPassword = formPersonalData.uppclPassword || '';
      this.aadharNo = formPersonalData.aadharNo || '';
      this.panNo = formPersonalData.panNo || '';
      this.bankName = formPersonalData.bankName || '';
      this.bankIfsc = formPersonalData.bankIfsc || '';
      this.bankAccountNo = formPersonalData.bankAccountNo || '';
      this.price = billData.price || 180000;
      this.advancePrice = billData.advancePrice || 0;

      this.generatedBy = formPersonalData.generatedBy || '';

      this.active = formPersonalData.active || 1;
    }
  }
}

export class SolarPanelModel {
  id?: number;
  panelSerial: string;
}

export class SolarBatteryModel {
  id?: number;
  serialNo: string;
}

export class SolarBillingModel {
  id: number;
  invoiceName: string;
  invoiceSerial: number;
  customerId: number;
  sessionYear: number;
  companyId: number;
  amount: number;
  solarSystemId: number;
  gstAmount: number;
  totalAmount: number;
  roundOffAmount: number;
  capacity: number;

  purchaseDate: string;
  paymentMode: number;
  chequeNo: string;
  bankName: string;
  details: string;
  approved: boolean;

  solarBillingProductModels: SolarBillingProductModel[] = [];

  constructor(customerData, billData, finalData) {
    this.id = billData.id;
    this.customerId = customerData.customerDetails ? customerData.customerDetails.id : '';
    this.sessionYear = customerData.sessionYear;
    this.capacity = billData.capacity || 0;
    this.solarSystemId = billData.solarSystemId || '';
    this.amount = finalData.amount;
    this.gstAmount = finalData.gstAmount;
    this.invoiceName = finalData.invoiceName || '';
    this.invoiceSerial = finalData.invoiceSerial || '';
    this.totalAmount = finalData.totalAmount;
    this.roundOffAmount = finalData.roundOffAmount;
    this.purchaseDate = finalData.purchaseDate ? formatDate(finalData.purchaseDate, settings.SAVE_DATE_FORMAT, 'en') : '';
    this.paymentMode = finalData.paymentMode || '';
    this.chequeNo = finalData.chequeNo || '';
    this.bankName = finalData.bankName || '';
    this.details = finalData.details || '';
  }
}

export class SolarBillingProductModel {
  id?: number;
  productId?: number;
  quantity?: number;
  companyId: number;
  gstPercentage: number;
  amount?: number;
  gstAmount?: number;
  totalAmount?: number;
}

export class SolarProductInventoryModel {
  id?: number;
  companyId: number;
  productId?: number;
  quantity?: number;
}

export class SolarProductMinimumModel {
  id?: number;
  capacity: number;
  productId: number;
  quantity: number;
}

export class ConfirmMessage {
  title: string;
  buttonCaption: string;
}


export class DeleteAll {
  exitDate: string;
}

