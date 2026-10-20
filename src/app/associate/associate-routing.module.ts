import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllassociateComponent } from './all-associate/all-associate.component';
import { AddAssociateComponent } from './add-associate/add-associate.component';
import { AboutAssociateComponent } from './about-associate/about-associate.component';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-associates',
        component: AllassociateComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-associate',
        component: AddAssociateComponent,
        canActivate: [AuthGuard, LoginGuard]
      },

      {
        path: 'about-associate',
        component: AboutAssociateComponent,
        canActivate: [LoginGuard]
      },


    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssociateRoutingModule { }
