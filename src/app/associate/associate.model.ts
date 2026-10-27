import { formatDate } from '@angular/common';
import { settings } from '../demo/data';

export class AssociateModel {
  id: number;
  name: string;
  fatherName: string;
  companyId: number;
  email: string;
  mobile: string;
  emergencyMobile: string;
  address: string;
  panNo: string;
  aadharNo: string;
  uploadImg: string;
  active: boolean;

  constructor(formPersonalData) {
    {
      this.id = formPersonalData.id;
      this.name = formPersonalData.name || '';
      this.fatherName = formPersonalData.fatherName || '';

      this.email = formPersonalData.email || '';
      this.mobile = formPersonalData.mobile || '';


      this.emergencyMobile = formPersonalData.emergencyMobile || '';
      this.panNo = formPersonalData.panNo || '';
      this.aadharNo = formPersonalData.aadharNo || '';

      this.address = formPersonalData.address || '';
      this.active = formPersonalData.active || 1;

    }
  }
}

export class AssociateDocumentModel {
  id: number;
  documentName: string;
  associateId: number;
  uploadDocument: string;
  active: boolean;
}



export class DeleteAll {
  sessionYear: number;
  exitDate: string;
}

