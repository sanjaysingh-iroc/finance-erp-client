import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllVendorComponent } from './all-vendors/all-vendors.component';
import { AddVendorComponent } from './add-vendor/add-vendor.component';
import { AboutVendorComponent } from './about-vendor/about-vendor.component';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-vendors',
        component: AllVendorComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-vendor',
        component: AddVendorComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
     
      {
        path: 'about-vendor',
        component: AboutVendorComponent,
        canActivate: [LoginGuard]
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorRoutingModule { }
