import { formatDate } from '@angular/common';
import { settings } from '../../demo/data';

export class CashReceiptModel {
  id: number;
  invoiceSerial: number;
  companyId: number;
  customerName: number;
  mobile: string;
  address: number;
  district: number;
  pinCode: number;
  amount: number;
  purchaseDate: string;
  paymentMode: number;
  chequeNo: string;
  bankName: string;
  details: string;
  paid: boolean;
  createdBy: number;
  approvedBy: number;
  isApproved: boolean;

  constructor(customerData) {
    this.customerName = customerData.customerName || '';
    this.mobile = customerData.mobile || '';
    this.address = customerData.address || '';
    this.district = customerData.district || '';
    this.pinCode = customerData.pinCode || '';
    this.invoiceSerial = customerData.invoiceSerial || '';

    this.amount = customerData.amount;
    this.purchaseDate = customerData.purchaseDate ? formatDate(customerData.purchaseDate, settings.SAVE_DATE_FORMAT, 'en') : '';
    this.paymentMode = customerData.paymentMode || '';
    this.chequeNo = customerData.chequeNo || '';
    this.bankName = customerData.bankName || '';
    this.amount = customerData.amount || 0;
    this.details = customerData.details || 'Solar Advance';
    this.paid = customerData.isPaid || false;
  }
}

export class SolarProposalModel {
  id: number;
  serialNo: number;
  companyId: number;
  customerName: number;
  address: number;
  district: number;
  pinCode: number;
  amount: number;
  proposalDate: string;
  capacity: number;
  inverterCapacity: number;
  gst: number;
  solarQuantity: number;
  solarModelId: number;

  batteryQuantity: number;
  batteryModelId: number;

  inverterModelId: number;

  constructor(customerData, productData) {
    this.companyId = customerData.companyId || '';
    this.customerName = customerData.customerName || '';

    this.address = customerData.address || '';
    this.district = customerData.district || '';
    this.pinCode = customerData.pinCode || '';
    this.serialNo = customerData.serialNo || '';

    this.capacity = productData.capacity || '';
    this.inverterCapacity = productData.inverterCapacity || '';

    this.gst = productData.gst || '';
    this.solarQuantity = productData.solarQuantity || '';
    this.solarModelId = productData.solarModelId || '';
    this.inverterModelId = productData.inverterModelId || '';
    this.proposalDate = customerData.proposalDate ? formatDate(customerData.proposalDate, settings.SAVE_DATE_FORMAT, 'en') : '';
    this.amount = productData.amount || 0;

    this.batteryQuantity = productData.batteryQuantity || 0;
    this.batteryModelId = productData.batteryModelId || '';
  }
}

export class SolarEstimateModel {
  id: number;
  serialNo: number;
  companyId: number;
  customerName: string;
  address: string;
  district: string;
  pinCode: string;
  capacity: number;
  amount: number;
  estimateDate: string;
  gst: number;
  solarQuantity: number;
  solarModelId: number;
  inverterModelId: number;


  constructor(customerData, productData) {
    this.customerName = customerData.customerName || '';
    this.serialNo = customerData.serialNo || 1;
    this.estimateDate = customerData.estimateDate ? formatDate(customerData.estimateDate, settings.SAVE_DATE_FORMAT, 'en') : '';
    this.address = customerData.address || '';
    this.district = customerData.district || '';
    this.pinCode = customerData.pinCode || '';

    this.capacity = productData.capacity || 0;
    this.amount = productData.amount || 0;
    this.gst = productData.gst || 0;
    this.solarQuantity = productData.solarQuantity || 0;
    this.amount = productData.amount || 0;
    this.solarModelId = productData.solarModelId || 0;
    this.inverterModelId = productData.inverterModelId || 0;
  }
}

export class SolarAgreementModel {
  id: number;
  companyId: number;
  customerId: number;
  electricityBoard: string;
  amount: number;
  agreementDate: string;
  capacity: number;
  solarModelId: number;
  inverterModelId: number;

  constructor(customerData) {
    this.companyId = customerData.companyId || '';
    this.electricityBoard = customerData.electricityBoard || '';
    this.amount = customerData.amount;
    this.agreementDate = customerData.agreementDate ? formatDate(customerData.agreementDate, settings.SAVE_DATE_FORMAT, 'en') : '';
    this.capacity = customerData.capacity || '';
    this.solarModelId = customerData.solarModelId || '';
    this.inverterModelId = customerData.inverterModelId || '';
  }
}