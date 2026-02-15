import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllExpensesComponent } from './all-expenses/all-expenses.component';
import { AddExpensesComponent } from './add-expenses/add-expenses.component';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
import { AllUnapproveExpensesComponent } from './all-unApproveExpenses/all-unApproveExpenses.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-expenses',
        component: AllExpensesComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-expenses',
        component: AddExpensesComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'all-unApproveExpenses',
        component: AllUnapproveExpensesComponent,
        canActivate: [AuthGuard, LoginGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpensesRoutingModule { }
