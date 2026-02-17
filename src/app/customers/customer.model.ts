import { formatDate } from '@angular/common';
import { settings } from '../demo/data';

export class CustomerModel {
  id: number;
  name: string;
  email: string;
  mobile: string;
  panNo: string;
  aadharNo: string;
  password: string;

  uploadImg: string;
  uploadAadhar: string;
  uploadPan: string;


  spouseName: string;
  spouseMobile: string;
  spousePanNo: string;
  spouseAadharNo: string;
  uploadSpouseImg: string;
  spouseUploadAadhar: string;
  spouseUploadPan: string;

  address: string;
  district: string;
  countryId: number;
  stateId: number;
  pinCode: string
  details: string;

  active: boolean;

  constructor(formPersonalData, formSpouseData, formData) {
    {

      this.id = formPersonalData.id;
      this.name = formPersonalData.name || '';
      this.email = formPersonalData.email || '';
      this.mobile = formPersonalData.mobile || '';
      this.panNo = formPersonalData.panNo || '';
      this.aadharNo = formPersonalData.aadharNo || '';
      this.password = formPersonalData.password || '';

      this.spouseName = formSpouseData.name || '';
      this.spouseMobile = formSpouseData.mobile || '';
      this.spousePanNo = formSpouseData.panNo || '';
      this.spouseAadharNo = formSpouseData.aadharNo || '';

      this.address = formData.address || '';
      this.district = formData.district || 'Firozabad';
      this.pinCode = formData.pinCode || '283203';
      this.countryId = formData.countryId || 1;
      this.stateId = formData.stateId || 36;
      this.details = formData.details || '';

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
  guarantorId: number;

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
      this.guarantorId = formData.guarantorId || '';
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
  approved: boolean;

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