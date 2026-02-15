import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
import { AddHolidayComponent } from './add-holiday/add-holiday.component';
import { AllHolidaysComponent } from './all-holidays/all-holidays.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-holidays',
        component: AllHolidaysComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-holiday',
        component: AddHolidayComponent,
        canActivate: [AuthGuard, LoginGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HolidayRoutingModule { }
