import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';

import { CompanyDetailsComponent } from './company-details/company-details.component';
import { AclSettingsComponent } from './acl-settings/acl-settings.component';

const routes: Routes = [
  {
    path: '',
    children: [

      {
        path: 'company',
        component: CompanyDetailsComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'acl',
        component: AclSettingsComponent,
        canActivate: [AuthGuard, LoginGuard]
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyRoutingModule { }
