import { formatDate } from '@angular/common';
import { settings } from '../demo/data';

export class BillingModel {
  id: number;
  invoiceName: string;
  customerId: number;
  sessionYear: number;
  amount: number;
  gstAmount: number;
  cgstAmount: number;

  totalAmount: number;
  roundOffAmount: number;

  purchaseDate: string;
  paymentMode: number;
  chequeNo: string;
  bankName: string;
  details: string;
  createdBy: number;
  approvedBy: number;
  isApproved: boolean;

  billingProductModels: BillingProductModel[] = [];

  constructor(customerData, billData) {
    this.id = billData.id;
    this.customerId = customerData.customerDetails ? customerData.customerDetails.id : '';
    this.sessionYear = billData.sessionYear;
    this.amount = billData.sessionYear;
    this.gstAmount = billData.sessionYear;
    this.cgstAmount = billData.sessionYear;

    this.totalAmount = billData.sessionYear;
    this.roundOffAmount = billData.roundOffAmount;

    this.purchaseDate = billData.submissionDate ? formatDate(billData.submissionDate, settings.SAVE_DATE_FORMAT, 'en') : '';
    this.paymentMode = billData.paymentMode || '';
    this.chequeNo = billData.chequeNo || '';
    this.bankName = billData.bankName || '';
    this.amount = billData.amount || '';
    this.details = billData.details || '';
    this.billingProductModels = billData.billingProductModels;
  }
}

export class BillingProductModel {
  id?: number;
  productId?: number;
  quantity?: number;
  serialNo?: string;
  amountPerUnit?: number;
  gstAmountPerUnit?: number;
  totalAmountPerUnit?: number;
  amount?: number;
  gstAmount?: number;
  totalAmount?: number;
}

export class ConfirmMessage {
  title: string;
  buttonCaption: string;
}


export class DeleteAll {
  exitDate: string;
}