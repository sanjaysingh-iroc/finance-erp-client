import { formatDate } from '@angular/common';
import { settings } from '../demo/data';

export class HolidayModel {
  id: number;
  name: string;
  holidayDate: string;
  sessionYear: number;
  active: number;

  constructor(formData) {
    {
      this.id = formData.id;
      this.name = formData.name || '';
      this.holidayDate = formData.holidayDate ? formatDate(formData.holidayDate, settings.SAVE_DATE_FORMAT, 'en') : '';
      this.active = formData.active || 1;
    }
  }
}
