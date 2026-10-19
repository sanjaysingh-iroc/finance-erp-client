import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';

import { NgxMaskModule } from 'ngx-mask';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { DocumentsRoutingModule } from './document-routing.module';
import { AddProposalFormatComponent } from './add-proposal-format/add-proposal-format.component';
import { AddEstimateFormatComponent } from './add-estimate-format/add-estimate-format.component';
import { AllMoneyReceiptsComponent } from './all-money-receipts/all-money-receipts.component';
import { AddSolarAgreementFormatComponent } from './add-solar-agreement-format/add-solar-agreement-format.component';
import { AddMoneyReceiptFormatComponent } from './add-money-receipt-format/add-money-receipt-format.component';
import { AllProposalFormatsComponent } from './all-proposal-formats/all-proposal-formats.component';
import { AllEstimateFormatsComponent } from './all-estimate-formats/all-estimate-formats.component';
import { AllSolarAgreementsComponent } from './all-solar-agreements/all-solar-agreements.component';
import { AddDeclarationLetterComponent } from './add-declaration-letter/add-declaration-letter.component';
import { AddCancellationLetterComponent } from './add-cancellation-letter/add-cancellation-letter.component';
import { AddWorkCompletionLetterComponent } from './add-work-completion-letter/add-work-completion-letter.component';
@NgModule({
  declarations: [
    AddProposalFormatComponent,
    AddEstimateFormatComponent,
    AddMoneyReceiptFormatComponent,
    AllMoneyReceiptsComponent,
    AddSolarAgreementFormatComponent,
    AddDeclarationLetterComponent,
    AllProposalFormatsComponent,
    AllEstimateFormatsComponent,
    AllSolarAgreementsComponent,
    AddCancellationLetterComponent,
    AddWorkCompletionLetterComponent
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
