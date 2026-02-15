import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomMaterialModule } from '../custom-material/custom-material.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';

import { NgxMaskModule } from 'ngx-mask';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { DocumentsRoutingModule } from './document-routing.module';
import { ProposalFormatComponent } from './proposal-format/proposal-format.component';
@NgModule({
  declarations: [
    ProposalFormatComponent,
  ],
  imports: [
    CommonModule,
    DocumentsRoutingModule,
    CustomMaterialModule,
    FullCalendarModule,
    NgxMaskModule,
    PerfectScrollbarModule,
    MatDialogModule,
    MatPaginatorModule,

  ]
})
export class DocumentsModule { }
