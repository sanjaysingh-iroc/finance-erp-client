import { formatDate } from '@angular/common';
import { settings } from '../demo/data';

export class AnnouncementModel {
  id: number;
  message: string;
  createDate: string;
  active: number;

  constructor(formData) {
    {
      this.message = formData.message || '';
      this.createDate = formData.createDate? formatDate(formData.createDate, settings.SAVE_DATE_FORMAT, 'en') : '';
      this.active = formData.active || 1;
    }
  }
}
