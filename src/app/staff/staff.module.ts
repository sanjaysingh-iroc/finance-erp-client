import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffRoutingModule } from './staff-routing.module';
import { AllstaffComponent } from './all-staff/all-staff.component';
import { DeleteDialogComponent } from './all-staff/dialog/delete/delete.component';
import { DeleteAllDialogComponent } from './all-staff/dialog/delete-all/delete-all.component';

import { AddStaffComponent } from './add-staff/add-staff.component';
import { AboutStaffComponent } from './about-staff/about-staff.component';
import { AttendanceStaffComponent } from './attendance-staff/attendance-staff.component';
import { StaffAttendanceApproveComponent } from './staff-attendance-approve/staff-attendance-approve.component';
import { DialogDeleteComponent } from './about-staff/dialog-delete-document/dialog-delete.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomMaterialModule } from '../custom-material/custom-material.module';
import { DialogViewAttendanceComponent } from './about-staff/view-dialog-staff-attendance/view-attendance.component';

import { NgxMaskModule } from 'ngx-mask';
import { ChangePasswordComponent } from './change-password/change-password.component';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { AddStaffLoanComponent } from './add-staff-loan/add-staff-loan.component';
import { AllStaffLoanComponent } from './all-staff-loans/all-staff-loans.component';
@NgModule({
  declarations: [
    AllstaffComponent,
    DeleteDialogComponent,
    AddStaffComponent,
    AboutStaffComponent,
    AttendanceStaffComponent,
    StaffAttendanceApproveComponent,
    DialogDeleteComponent,
    DeleteAllDialogComponent,
    DialogViewAttendanceComponent,
    ChangePasswordComponent,
    AddStaffLoanComponent,
    AllStaffLoanComponent
  ],
  imports: [
    CommonModule,
    StaffRoutingModule,
    CustomMaterialModule,
    FullCalendarModule,
    NgxMaskModule,
    PerfectScrollbarModule
  ]
})
export class StaffModule { }
