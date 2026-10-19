import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllstaffComponent } from './all-staff/all-staff.component';
import { AddStaffComponent } from './add-staff/add-staff.component';
import { AboutStaffComponent } from './about-staff/about-staff.component';
import { AttendanceStaffComponent } from './attendance-staff/attendance-staff.component';
import { StaffAttendanceApproveComponent } from './staff-attendance-approve/staff-attendance-approve.component';
import {ChangePasswordComponent} from './change-password/change-password.component';
import { AuthGuard } from '../../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../../auth/guards/login-gaurd.component';
import { AddStaffLoanComponent } from './add-staff-loan/add-staff-loan.component';
import { AllStaffLoanComponent } from './all-staff-loans/all-staff-loans.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-staff',
        component: AllstaffComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-staff',
        component: AddStaffComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'attendance-staff',
        component: AttendanceStaffComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'attendance-approve-staff',
        component: StaffAttendanceApproveComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'about-staff',
        component: AboutStaffComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'add-staff-loan',
        component: AddStaffLoanComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
       {
        path: 'all-staff-loans',
        component: AllStaffLoanComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'changePassword',
        component: ChangePasswordComponent,
        canActivate: [LoginGuard]
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }
