import { formatDate } from '@angular/common';
import { settings } from '../demo/data';

export class CustomerModel {
  id: number;
  name: string;
  contactPersonName: string;
  salutation: number;
  gender: number;
  email: string;
  mobile: string;
  emergencyMobile: string;
  address: string;
  district: string;
  countryId: number;
  stateId: number;
  pinCode: string
  uploadImg: string;
  uploadDoc: string;
  details: string;

  panNo: string;
  gstNo: string;
  createdBy: number;
  active: boolean;

  constructor(formPersonalData) {
    {

      this.id = formPersonalData.id;
      this.name = formPersonalData.name || '';
      this.contactPersonName = formPersonalData.contactPersonName || '';
      this.salutation = formPersonalData.salutation || '';
      this.gender = formPersonalData.gender || '';
      this.email = formPersonalData.email || '';
      this.mobile = formPersonalData.mobile || '';
      this.emergencyMobile = formPersonalData.emergencyMobile || '';
      this.address = formPersonalData.address || '';
      this.district = formPersonalData.district || 'Firozabad';
      this.pinCode = formPersonalData.pinCode || '283203';
      this.countryId = formPersonalData.countryId || '1';
      this.stateId = formPersonalData.stateId || '36';
      this.details = formPersonalData.details || '';
      this.panNo = formPersonalData.panNo || '';
      this.gstNo = formPersonalData.gstNo || '';

      this.active = formPersonalData.active || 1;
    }
  }
}

export class DeleteAll {
  exitDate: string;
}


export class CustomerLoanModel {
  id: number;
  customerId: number;
  invoiceId: number;
  customerLoanDate: string;
  customerLoanName: string;
  amount: number;
  interestAmount: number;
  emiAmount: number;

  comment: string;
  uploadDoc: string;
  createdBy: number;
  approvedBy: number;
  approved: boolean;
  complete: boolean;

  constructor(formData) {
    {
      this.id = formData.id;
      this.invoiceId = formData.invoiceId || '';
      this.customerLoanDate = formData.customerLoanDate || '';
      this.amount = formData.amount || '';
      this.emiAmount = formData.emiAmount || '';
      this.interestAmount = formData.interestAmount || '';

      this.customerLoanName = formData.customerLoanName || '';
      this.comment = formData.comment || '';
    }
  }
}

export class CustomerLoanAmountModel {
  id: number;
  customerId: number;
  loanId: number;
  depositDate: string;
  amount: number;
  comment: string;
  createdBy: number;
  approvedBy: number;
  isApproved: boolean;
  constructor(formData) {
    {
      this.id = formData.id;
      this.customerId = formData.customerId || '';
      this.loanId = formData.loanId || '';
      this.depositDate = formData.depositDate || '';
      this.amount = formData.amount || '';
      this.comment = formData.comment || '';
    }
  }
}