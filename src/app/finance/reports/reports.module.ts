import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { StaffAttendanceComponent } from './staff-attendance/staff-attendance.component';
import { PerfectScrollbarModule, } from 'ngx-perfect-scrollbar';
import { InventoryReportComponent } from './inventory-report/inventory-report.component';
import { SolarInventoryReportComponent } from './solar-inventory-report/solar-inventory-report.component';


@NgModule({
  declarations: [
    StaffAttendanceComponent,
    InventoryReportComponent,
    SolarInventoryReportComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    CustomMaterialModule,
    PerfectScrollbarModule,
  ]
})
export class ReportsModule { }
