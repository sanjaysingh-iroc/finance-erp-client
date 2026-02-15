import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
import { ProposalFormatComponent } from './proposal-format/proposal-format.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'proposal-format',
        component: ProposalFormatComponent,
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
