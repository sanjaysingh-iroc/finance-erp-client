import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
import { AddCustomerLeadComponent } from './add-customer-lead/add-customer-lead.component';
import { AllCustomerLeadComponent } from './all-customers-lead/all-customers-lead.component';
import { AddSolarCustomerComponent } from './add-solar-customer/add-solar-customer.component';
import { AllSolarCustomersComponent } from './all-solar-customers/all-solar-customers.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-customers-lead',
        component: AllCustomerLeadComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-customer-lead',
        component: AddCustomerLeadComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'all-solar-customers',
        component: AllSolarCustomersComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-solar-customer',
        component: AddSolarCustomerComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerLeadRoutingModule { }
