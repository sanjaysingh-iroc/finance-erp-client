import { formatDate } from '@angular/common';
import { settings } from '../../demo/data';

export class StaffModel {
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

export class StaffDocumentModel {
  id: number;
  documentName: string;
  staffId: number;
  uploadDocument: string;
  active: boolean;
}

export class StaffAttendanceDateModel {
  staffId: number;
  attendanceDate: string;
}

export class StaffAttendanceApprovalModel {
  attendanceDate: string;
  approvedBy: number;
  companyId: number;
}

export class DateDataModel {
  isSelected: boolean;
  isIndeterminate: boolean;
  weekDay: number;
  showDate: string;
  date: string;
  actualDate: Date;
  day: string
}


export class ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  constructor(formData) {
    {
      this.oldPassword = formData.oldPassword;
      this.newPassword = formData.newPassword;
    }
  }
}

export class DeleteAll {
  sessionYear: number;
  exitDate: string;
}


export class StaffLoanModel {
  id: number;
  staffId: number;
  staffLoanDate: string;
  amount: number;
  comment: string;
  isApproved: boolean;
  companyId: number;

  constructor(formData) {
    {
      this.id = formData.id;
      this.staffId = formData.staffId || '';
      this.staffLoanDate = formData.staffLoanDate || '';
      this.amount = formData.amount || '';
      this.comment = formData.comment || '';
      this.isApproved = formData.isApproved || false;
    }
  }
}