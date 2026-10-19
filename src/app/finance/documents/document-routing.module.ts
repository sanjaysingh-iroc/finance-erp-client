import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../../auth/guards/login-gaurd.component';
import { AddProposalFormatComponent } from './add-proposal-format/add-proposal-format.component';
import { AddEstimateFormatComponent } from './add-estimate-format/add-estimate-format.component';
import { AllMoneyReceiptsComponent } from './all-money-receipts/all-money-receipts.component';
import { AddSolarAgreementFormatComponent } from './add-solar-agreement-format/add-solar-agreement-format.component';
import { AddMoneyReceiptFormatComponent } from './add-money-receipt-format/add-money-receipt-format.component';
import { AllSolarAgreementsComponent } from './all-solar-agreements/all-solar-agreements.component';
import { AllProposalFormatsComponent } from './all-proposal-formats/all-proposal-formats.component';
import { AllEstimateFormatsComponent } from './all-estimate-formats/all-estimate-formats.component';
import { AddDeclarationLetterComponent } from './add-declaration-letter/add-declaration-letter.component';
import { AddCancellationLetterComponent } from './add-cancellation-letter/add-cancellation-letter.component';
import { AddWorkCompletionLetterComponent } from './add-work-completion-letter/add-work-completion-letter.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-proposal-format',
        component: AllProposalFormatsComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-proposal-format',
        component: AddProposalFormatComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'all-estimate-format',
        component: AllEstimateFormatsComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-estimate-format',
        component: AddEstimateFormatComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'all-solar-agreement-format',
        component: AllSolarAgreementsComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-solar-agreement-format',
        component: AddSolarAgreementFormatComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'all-money-receipts',
        component: AllMoneyReceiptsComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-money-receipt-format',
        component: AddMoneyReceiptFormatComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-declaration-letter',
        component: AddDeclarationLetterComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-cancellation-letter',
        component: AddCancellationLetterComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-work-completion-letter',
        component: AddWorkCompletionLetterComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsRoutingModule { }
