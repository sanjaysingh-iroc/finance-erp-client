import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomMaterialModule } from '../custom-material/custom-material.module';

import { NgxMaskModule } from 'ngx-mask';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { AddCustomerLeadComponent } from './add-customer-lead/add-customer-lead.component';
import { CustomerLeadRoutingModule } from './customer-lead-routing.module';
import { AllCustomerLeadComponent } from './all-customers-lead/all-customers-lead.component';
import { AllSolarCustomersComponent } from './all-solar-customers/all-solar-customers.component';
import { AddSolarCustomerComponent } from './add-solar-customer/add-solar-customer.component';
@NgModule({
  declarations: [
    AllCustomerLeadComponent,
    AddCustomerLeadComponent,
    AllSolarCustomersComponent,
    AddSolarCustomerComponent
  ],
  imports: [
    CommonModule,
    CustomerLeadRoutingModule,
    CustomMaterialModule,
    FullCalendarModule,
    NgxMaskModule,
    PerfectScrollbarModule
  ]
})
export class CustomerLeadModule { }
