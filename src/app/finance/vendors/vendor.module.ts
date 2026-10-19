import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorRoutingModule } from './vendor-routing.module';
import { AllVendorComponent } from './all-vendors/all-vendors.component';

import { AddVendorComponent } from './add-vendor/add-vendor.component';
import { AboutVendorComponent } from './about-vendor/about-vendor.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';

import { NgxMaskModule } from 'ngx-mask';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
@NgModule({
  declarations: [
    AllVendorComponent,
    AddVendorComponent,
    AboutVendorComponent,
  ],
  imports: [
    CommonModule,
    VendorRoutingModule,
    CustomMaterialModule,
    FullCalendarModule,
    NgxMaskModule,
    PerfectScrollbarModule
  ]
})
export class VendorModule { }
