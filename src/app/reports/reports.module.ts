import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { CustomMaterialModule } from '../custom-material/custom-material.module';
import { StaffAttendanceComponent } from './staff-attendance/staff-attendance.component';
import { NewStaffReportComponent } from './new-staff-report/new-staff-report.component';
import { PerfectScrollbarModule, } from 'ngx-perfect-scrollbar';
import { InventoryReportComponent } from './inventory-report/inventory-report.component';


@NgModule({
  declarations: [
    NewStaffReportComponent,
    StaffAttendanceComponent,
    InventoryReportComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    CustomMaterialModule,
    PerfectScrollbarModule,
  ]
})
export class ReportsModule { }
