import { formatDate } from '@angular/common';
import { settings } from '../../demo/data';

export class CustomerModel {
  id: number;
  name: string;
  contactPersonName: string;
  email: string;
  mobile: string;
  emergencyMobile: string;
  address: string;
  location: string;
  companyId: number;

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
      this.email = formPersonalData.email || '';
      this.mobile = formPersonalData.mobile || '';
      this.emergencyMobile = formPersonalData.emergencyMobile || '';
      this.address = formPersonalData.address || '';
      this.location = formPersonalData.location || '';

      this.district = formPersonalData.district || '';
      this.pinCode = formPersonalData.pinCode || '';
      this.countryId = formPersonalData.countryId || 1;
      this.stateId = formPersonalData.stateId || 0;
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
  guarantorName: string;
  guarantorMobile: string;
  companyId: number;

  comment: string;
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
      this.emiAmount = formData.emiAmount || 0;
      this.interestAmount = formData.interestAmount || 0;
      this.guarantorName = formData.guarantorName || '';
      this.guarantorMobile = formData.guarantorMobile || '';

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
  companyId: number;

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