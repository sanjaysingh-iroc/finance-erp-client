import { formatDate } from '@angular/common';
import { settings } from '../../demo/data';

export class VendorModel {
  id: number;
  firmName: string;
  contactPersonName: string;
  email: string;
  mobile: string;
  emergencyMobile: string;
  address: string;
  uploadImg: string;
  details: string;
  companyId: number;

  active: boolean;

  constructor(formPersonalData) {
    {

      this.id = formPersonalData.id;
      this.firmName = formPersonalData.firmName || '';
      this.contactPersonName = formPersonalData.contactPersonName || '';
      this.email = formPersonalData.email || '';
      this.mobile = formPersonalData.mobile || '';

      this.emergencyMobile = formPersonalData.emergencyMobile || '';
      this.address = formPersonalData.address || '';
      this.details = formPersonalData.details || '';

      this.active = formPersonalData.active || 1;
    }
  }
}

export class DeleteAll {
  exitDate: string;
}