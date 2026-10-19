import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { CustomMaterialModule } from '../custom-material/custom-material.module';
import { StaffAttendanceComponent } from './staff-attendance/staff-attendance.component';
import { PerfectScrollbarModule, } from 'ngx-perfect-scrollbar';


@NgModule({
  declarations: [
    StaffAttendanceComponent,
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    CustomMaterialModule,
    PerfectScrollbarModule,
  ]
})
export class ReportsModule { }
