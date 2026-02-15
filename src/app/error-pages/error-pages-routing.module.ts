import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
import { Page401Component } from './page401/page401.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [LoginGuard],
    children: [
      {
        path: '',
        redirectTo: 'page404',
        pathMatch: 'full'
      },
      {
        path: 'page401',
        component: Page401Component,
      },
      {
        path: 'page404',
        component: Page404Component
      },
      {
        path: 'page500',
        component: Page500Component
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErrorPageRoutingModule { }
