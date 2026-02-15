import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllSessionsComponent } from './all-sessions/all-sessions.component';
import { AddSessionComponent } from './add-session/add-session.component';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
import { UpdateSessionsComponent } from './update-sessions/update-sessions.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-session',
        component: AllSessionsComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-session',
        component: AddSessionComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'update-session',
        component: UpdateSessionsComponent,
        canActivate: [AuthGuard, LoginGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionRoutingModule { }
