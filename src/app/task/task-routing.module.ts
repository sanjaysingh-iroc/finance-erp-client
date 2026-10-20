import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllTaskComponent } from './all-task/all-task.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-task',
        component: AllTaskComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-task',
        component: AddTaskComponent,
        canActivate: [AuthGuard, LoginGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskRoutingModule { }
