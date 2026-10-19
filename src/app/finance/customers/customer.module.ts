import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerRoutingModule } from './customer-routing.module';
import { AllCustomerComponent } from './all-customers/all-customers.component';

import { AddCustomerComponent } from './add-customer/add-customer.component';
import { AboutCustomerComponent } from './about-customer/about-customer.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';

import { NgxMaskModule } from 'ngx-mask';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { AddCustomerLoanComponent } from './add-customer-loan/add-customer-loan.component';
import { AllCustomerLoanComponent } from './all-customer-loans/all-customer-loans.component';
import { AddCustomerLoanAmountComponent } from './add-customer-loan-amount/add-customer-loan-amount.component';
import { ViewCustomerLoanAmountComponent } from './view-customer-loan-amount/view-customer-loan-amount.component';
@NgModule({
  declarations: [
    AllCustomerComponent,
    AddCustomerComponent,
    AboutCustomerComponent,
    AddCustomerLoanComponent,
    AllCustomerLoanComponent,
    AddCustomerLoanAmountComponent,
    ViewCustomerLoanAmountComponent
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    CustomMaterialModule,
    FullCalendarModule,
    NgxMaskModule,
    PerfectScrollbarModule
  ]
})
export class CustomerModule { }
