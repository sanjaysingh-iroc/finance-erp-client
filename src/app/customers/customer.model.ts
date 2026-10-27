export class CustomerModel {
  id: number;
  name: string;
  fatherName: string;
  email: string;
  mobile: string;
  emergencyMobile: string;
  address: string;
  location: string;
  companyId: number;

  district: string;
  countryId: number;
  stateId: number;
  pinCode: string;


  panNo: string;
  aadharNo: string;
  details: string;
  uploadImg: string;
  uploadAdharDoc: string;
  uploadPanDoc: string;


  createdBy: number;
  active: boolean;

  constructor(formPersonalData) {
    {

      this.id = formPersonalData.id;
      this.name = formPersonalData.name || '';
      this.fatherName = formPersonalData.fatherName || '';

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
      this.aadharNo = formPersonalData.aadharNo || '';

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
  loanDate: string;

  lendedAmount: number;
  refundableAmount: number;
  fileChargeAmount: number;
  installmentAmount: number;

  associateId: number;
  fosId: number;

  duration: number;
  groupId: number;

  companyId: number;

  comment: string;
  createdBy: number;
  approvedBy: number;
  approved: boolean;
  complete: boolean;

  constructor(formData) {
    {
      this.id = formData.id;
      this.loanDate = formData.loanDate || '';
      this.lendedAmount = formData.lendedAmount || '';
      this.refundableAmount = formData.refundableAmount || '';
      this.fileChargeAmount = formData.fileChargeAmount || '';
      this.installmentAmount = formData.installmentAmount || '';
      this.fosId = formData.fosId || '';

      this.duration = formData.duration || '';
      this.groupId = formData.groupId || '';

      this.comment = formData.comment || '';
    }
  }
}

export class CustomerLoanAmountModel {
  id: number;
  customerId: number;
  loanId: number;
  depositDate: string;
  paymentMode: number;
  amount: number;
  comment: string;
  createdBy: number;
  approvedBy: number;
  approved: boolean;
  companyId: number;

  constructor(formData) {
    {
      this.id = formData.id;
      this.customerId = formData.customerId || '';
      this.loanId = formData.loanId || '';
      this.depositDate = formData.depositDate || '';
      this.amount = formData.amount || '';
      this.paymentMode = formData.paymentMode || '';
      this.comment = formData.comment || '';
    }
  }
}