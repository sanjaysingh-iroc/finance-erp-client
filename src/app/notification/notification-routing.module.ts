import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
import { InboxComponent } from './inbox/inbox.component';
import { ReadNotificationComponent } from './read-notification/read-notification.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'inbox',
        component: InboxComponent,
        canActivate: [AuthGuard, LoginGuard]
      },

      {
        path: 'read-notification',
        component: ReadNotificationComponent,
        canActivate: [AuthGuard, LoginGuard]
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule { }
