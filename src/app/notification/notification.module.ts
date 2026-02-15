import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationRoutingModule } from './notification-routing.module';
import { InboxComponent } from './inbox/inbox.component';
import { ReadNotificationComponent } from './read-notification/read-notification.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
@NgModule({
  declarations: [InboxComponent, ReadNotificationComponent],
  imports: [
    CommonModule,
    NotificationRoutingModule,
    MatCheckboxModule,
    CKEditorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PerfectScrollbarModule
  ]
})
export class NotificationModule {}
