import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainDashBoardComponent } from './main-dashboard/main-dashboard.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
import { StaffAuthGuard } from '../auth/guards/staff-auth-gaurd.component';
import { SearchPeopleComponent } from './search-people/search-people.component';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { DashboardAclComponent } from './dashboard-acl/dashboard-acl.component';

const routes: Routes = [
  {
    path: '',

    children: [
      {
        path: 'staff-dashboard',
        component: MainDashBoardComponent,
        canActivate: [LoginGuard, StaffAuthGuard],
      },
      {
        path: 'dashboard-acl',
        component: DashboardAclComponent,
        canActivate: [LoginGuard, StaffAuthGuard],
      },
      {
        path: 'search-people',
        component: SearchPeopleComponent,
        canActivate: [LoginGuard, StaffAuthGuard, AuthGuard]
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
