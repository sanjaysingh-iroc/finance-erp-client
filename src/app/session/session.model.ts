import { formatDate } from '@angular/common';
import { settings } from '../demo/data';

export class SessionModel {
  id: number;
  name: string;
  fromDate: string;
  toDate: string;
  isActive: number;
  previousSessionId: number;
  
  constructor(formData) {
    {
      this.name = formData.name || '';
      this.previousSessionId = formData.previousSessionId || '';
      this.fromDate = formData.fromDate? formatDate(formData.fromDate, settings.SAVE_DATE_FORMAT, 'en') : '';
      this.toDate = formData.toDate? formatDate(formData.toDate, settings.SAVE_DATE_FORMAT, 'en') : '';
      this.isActive = formData.isActive || 2;
    }
  }
}
