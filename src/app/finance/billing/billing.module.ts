import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingRoutingModule } from './billing-routing.module';
import { AllBillingComponent } from './all-billings/all-billings.component';
import { BillingReceiptComponent } from './billings-receipt/billings-receipt.component';

import { AddBillingComponent } from './add-billing/add-billing.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';

import { NgxMaskModule } from 'ngx-mask';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    AllBillingComponent,
    AddBillingComponent,
    BillingReceiptComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    BillingRoutingModule,
    CustomMaterialModule,
    FullCalendarModule,
    NgxMaskModule,
    PerfectScrollbarModule,
    MatDialogModule,
    MatPaginatorModule,

  ]
})
export class BillingModule { }
