import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllCustomerComponent } from './all-customers/all-customers.component';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { AboutCustomerComponent } from './about-customer/about-customer.component';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
import { AddCustomerLoanComponent } from './add-customer-loan/add-customer-loan.component';
import { AllCustomerLoanComponent } from './all-customer-loans/all-customer-loans.component';
import { AddCustomerLoanAmountComponent } from './add-customer-loan-amount/add-customer-loan-amount.component';
import { ViewCustomerLoanAmountComponent } from './view-customer-loan-amount/view-customer-loan-amount.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-customers',
        component: AllCustomerComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-customer',
        component: AddCustomerComponent,
        canActivate: [AuthGuard, LoginGuard]
      },

      {
        path: 'about-customer',
        component: AboutCustomerComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'add-customer-loan',
        component: AddCustomerLoanComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
       {
        path: 'all-customer-loans',
        component: AllCustomerLoanComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
       {
        path: 'add-customer-loan-amount',
        component: AddCustomerLoanAmountComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
       {
        path: 'view-customer-loan-amount',
        component: ViewCustomerLoanAmountComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
