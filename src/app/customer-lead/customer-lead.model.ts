import { formatDate } from '@angular/common';
import { settings } from '../demo/data';

export class CustomerLeadModel {
  id: number;
  name: string;
  email: string;
  mobile: string;
  address: string;
  details: string;
  activityDate: string;
  nextActivityDate: string;
  activityAction: string;
  assignTo: number;
  active: boolean;
  constructor(formPersonalData) {
    {

      this.id = formPersonalData.id;
      this.name = formPersonalData.name || '';
      this.email = formPersonalData.email || '';
      this.mobile = formPersonalData.mobile || '';
      this.address = formPersonalData.address || '';
      this.activityAction = formPersonalData.activityAction || '';
      this.activityDate = formPersonalData.activityDate ? formatDate(formPersonalData.activityDate, settings.SAVE_DATE_FORMAT, 'en') : '';
      this.nextActivityDate = formPersonalData.nextActivityDate ? formatDate(formPersonalData.nextActivityDate, settings.SAVE_DATE_FORMAT, 'en') : '';
      this.details = formPersonalData.details || '';
      this.assignTo = formPersonalData.assignTo || '';

      this.active = formPersonalData.active || 1;
    }
  }
}


export class SolarCustomerModel {
  id: number;
  name: string;
  email: string;
  mobile: string;
  emergencyMobile: string;
  address: string;
  electricityMeterNo: string;
  uppclPassword: string;
  aadharNo: string;
  panNo: string;
  bankName: string;
  bankIfsc: string;
  bankAccountNo: string;
  productDetails: string;
  pendingTask: string;
  nextActivityDate: string;
  uploadDoc: string;


  applicantName: string;
  applicantEmail: string;
  applicantMobile: string;
  applicantAadharNo: string;
  applicantPanNo: string;
  applicantBankName: string;
  applicantBankIfsc: string;
  applicantBankAccountNo: string;
  applicantUploadDoc: string;

  active: boolean;

  constructor(formPersonalData, formApplicantPersonalData) {
    {

      this.id = formPersonalData.id;
      this.name = formPersonalData.name || '';
      this.email = formPersonalData.email || '';
      this.mobile = formPersonalData.mobile || '';
      this.emergencyMobile = formPersonalData.emergencyMobile || '';
      this.address = formPersonalData.address || '';
      this.electricityMeterNo = formPersonalData.electricityMeterNo || '';
      this.uppclPassword = formPersonalData.uppclPassword || '';
      this.aadharNo = formPersonalData.aadharNo || '';
      this.panNo = formPersonalData.panNo || '';
      this.bankName = formPersonalData.bankName || '';
      this.bankIfsc = formPersonalData.bankIfsc || '';
      this.bankAccountNo = formPersonalData.bankAccountNo || '';
      this.productDetails = formPersonalData.productDetails || '';
      this.pendingTask = formPersonalData.pendingTask || '';
      this.nextActivityDate = formPersonalData.nextActivityDate ? formatDate(formPersonalData.nextActivityDate, settings.SAVE_DATE_FORMAT, 'en') : '';
      this.active = formPersonalData.active || 1;

      this.applicantName = formApplicantPersonalData.applicantName || '';
      this.applicantEmail = formApplicantPersonalData.applicantEmail || '';
      this.applicantMobile = formApplicantPersonalData.applicantMobile || '';
      this.applicantAadharNo = formApplicantPersonalData.applicantAadharNo || '';
      this.applicantPanNo = formApplicantPersonalData.applicantPanNo || '';
      this.applicantBankName = formApplicantPersonalData.applicantBankName || '';
      this.applicantBankIfsc = formApplicantPersonalData.applicantBankIfsc || '';
      this.applicantBankAccountNo = formApplicantPersonalData.applicantBankAccountNo || '';

    }
  }
}

export class DeleteAll {
  exitDate: string;
}

