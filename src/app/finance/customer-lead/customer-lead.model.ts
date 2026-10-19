import { formatDate } from '@angular/common';
import { settings } from '../../demo/data';

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
  generatedBy: number;
  companyId: number;

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
      this.generatedBy = formPersonalData.generatedBy || '';

      this.active = formPersonalData.active || 1;
    }
  }
}



export class DeleteAll {
  exitDate: string;
}

