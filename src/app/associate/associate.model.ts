import { formatDate } from '@angular/common';
import { settings } from '../demo/data';

export class AssociateModel {
  id: number;
  empCode: string;
  name: string;
  dob: string;
  dateOfJoining: string;
  salary: number;
  companyId: number;

  email: string;
  mobile: string;
  password: string;
  userType: number;
  emergencyMobile: string;
  address: string;
  education: string;
  uploadImg: string;
  exitDate: string;
  exitSession: number;
  active: boolean;

  constructor(formPersonalData, formProfessionalData) {
    {
      this.email = formPersonalData.email || '';
      this.mobile = formPersonalData.mobile || '';

      this.id = formPersonalData.id;
      this.empCode = formPersonalData.empCode || '';
      this.name = formPersonalData.name || '';
      this.dob = formPersonalData.dob ? formatDate(formPersonalData.dob, settings.SAVE_DATE_FORMAT, 'en') : '';
      this.emergencyMobile = formPersonalData.emergencyMobile || '';
      this.address = formPersonalData.address || '';
      this.active = formPersonalData.active || 1;

      this.password = formProfessionalData.password || '';
      this.userType = formProfessionalData.userType || '';
      this.dateOfJoining = formProfessionalData.dateOfJoining ? formatDate(formProfessionalData.dateOfJoining, settings.SAVE_DATE_FORMAT, 'en') : '';
      this.salary = formProfessionalData.salary || '';
      this.education = formProfessionalData.education || '';

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

