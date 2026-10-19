import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';

import { NgxMaskModule } from 'ngx-mask';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { AddSolarBillingComponent } from './add-solar-billing/add-solar-billing.component';
import { SolarBillingReceiptComponent } from './billings-solar-receipt/billings-solar-receipt.component';
import { AllSolarBillingComponent } from './all-solar-billings/all-solar-billings.component';
import { SolarBillingRoutingModule } from './solar-billing-routing.module';
import { AddSolarInventoryComponent } from './add-solar-inventory/add-solar-inventory.component';
import { SpentSolarInventoryComponent } from './spent-solar-inventory/spent-solar-inventory.component';
import { AddMinimumSolarItemsComponent } from './add-minimum-solar-item/add-minimum-solar-item.component';
import { AllSolarCustomersComponent } from './all-solar-customers/all-solar-customers.component';
import { AddSolarCustomerComponent } from './add-solar-customer/add-solar-customer.component';
import { AllCompleteSolarCustomersComponent } from './all-complete-solar-customers/all-complete-solar-customers.component';

@NgModule({
  declarations: [
    AllSolarBillingComponent,
    AddSolarBillingComponent,
    AddSolarBillingComponent,
    SolarBillingReceiptComponent,
    AddSolarInventoryComponent,
    SpentSolarInventoryComponent,
    AddMinimumSolarItemsComponent,
    AllSolarCustomersComponent,
    AddSolarCustomerComponent,
    AllCompleteSolarCustomersComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    SolarBillingRoutingModule,
    CustomMaterialModule,
    FullCalendarModule,
    NgxMaskModule,
    PerfectScrollbarModule,
    MatDialogModule,
    MatPaginatorModule,

  ]
})
export class SolarModule { }
