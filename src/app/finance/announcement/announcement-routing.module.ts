import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllAnnouncementComponent } from './all-announcement/all-announcement.component';
import { AddAnnouncementComponent } from './add-announcement/add-announcement.component';
import { AuthGuard } from '../../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../../auth/guards/login-gaurd.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-announcement',
        component: AllAnnouncementComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-announcement',
        component: AddAnnouncementComponent,
        canActivate: [AuthGuard, LoginGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnnouncementRoutingModule { }
