import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllBillingComponent } from './all-billings/all-billings.component';
import { AddBillingComponent } from './add-billing/add-billing.component';
import { BillingReceiptComponent } from './billings-receipt/billings-receipt.component';
import { AuthGuard } from '../../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../../auth/guards/login-gaurd.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-billings',
        component: AllBillingComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-billing',
        component: AddBillingComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'billing-receipt',
        component: BillingReceiptComponent,
        canActivate: [LoginGuard]
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingRoutingModule { }
