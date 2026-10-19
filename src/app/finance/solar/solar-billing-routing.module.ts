import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../../auth/guards/login-gaurd.component';
import { AddSolarBillingComponent } from './add-solar-billing/add-solar-billing.component';
import { SolarBillingReceiptComponent } from './billings-solar-receipt/billings-solar-receipt.component';
import { AllSolarBillingComponent } from './all-solar-billings/all-solar-billings.component';
import { AddSolarInventoryComponent } from './add-solar-inventory/add-solar-inventory.component';
import { SpentSolarInventoryComponent } from './spent-solar-inventory/spent-solar-inventory.component';
import { AddMinimumSolarItemsComponent } from './add-minimum-solar-item/add-minimum-solar-item.component';
import { AllSolarCustomersComponent } from './all-solar-customers/all-solar-customers.component';
import { AddSolarCustomerComponent } from './add-solar-customer/add-solar-customer.component';
import { AllCompleteSolarCustomersComponent } from './all-complete-solar-customers/all-complete-solar-customers.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-solar-customers',
        component: AllSolarCustomersComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'all-complete-solar-customers',
        component: AllCompleteSolarCustomersComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-solar-customer',
        component: AddSolarCustomerComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'all-solar-billings',
        component: AllSolarBillingComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-solar-billing',
        component: AddSolarBillingComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'solar-billing-receipt',
        component: SolarBillingReceiptComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'add-solar-inventory',
        component: AddSolarInventoryComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'spent-solar-inventory',
        component: SpentSolarInventoryComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-minimum-solar-items',
        component: AddMinimumSolarItemsComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolarBillingRoutingModule { }
