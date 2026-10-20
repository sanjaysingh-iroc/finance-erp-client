import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssociateRoutingModule } from './associate-routing.module';
import { AllassociateComponent } from './all-associate/all-associate.component';
import { DeleteDialogComponent } from './all-associate/dialog/delete/delete.component';
import { DeleteAllDialogComponent } from './all-associate/dialog/delete-all/delete-all.component';

import { AddAssociateComponent } from './add-associate/add-associate.component';
import { AboutAssociateComponent } from './about-associate/about-associate.component';
import { DialogDeleteComponent } from './about-associate/dialog-delete-document/dialog-delete.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomMaterialModule } from '../custom-material/custom-material.module';

import { NgxMaskModule } from 'ngx-mask';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
@NgModule({
  declarations: [
    AllassociateComponent,
    DeleteDialogComponent,
    AddAssociateComponent,
    AboutAssociateComponent,
    DialogDeleteComponent,
    DeleteAllDialogComponent,
  ],
  imports: [
    CommonModule,
    AssociateRoutingModule,
    CustomMaterialModule,
    FullCalendarModule,
    NgxMaskModule,
    PerfectScrollbarModule
  ]
})
export class AssociateModule { }
