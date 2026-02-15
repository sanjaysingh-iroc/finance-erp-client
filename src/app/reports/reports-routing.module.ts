import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
import { StaffAttendanceComponent } from './staff-attendance/staff-attendance.component';
import { NewStaffReportComponent } from './new-staff-report/new-staff-report.component';
import { InventoryReportComponent } from './inventory-report/inventory-report.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'inventory-report',
        component: InventoryReportComponent,
        canActivate: [AuthGuard, LoginGuard]
      },

      {
        path: 'new-staffs',
        component: NewStaffReportComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'staff-attendance',
        component: StaffAttendanceComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
