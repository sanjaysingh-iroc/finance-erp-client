import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from './main-routing.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'dashboard',
      loadChildren: () =>
        import('../dashboard/dashboard.module')
          .then(m => m.DashboardModule)
    },
    {
      path: 'session',
      loadChildren: () => import('../session/session.module')
        .then(m => m.SessionModule),
    },
    {
      path: 'company',
      loadChildren: () => import('../company-settings/company-settings.module')
        .then(m => m.CompanyDetailsModule),
    },
    {
      path: 'announcement',
      loadChildren: () => import('../announcement/announcement.module')
        .then(m => m.AnnouncementModule),
    },

    {
      path: 'customers',
      loadChildren: () => import('../customers/customer.module')
        .then(m => m.CustomerModule),
    },

    {
      path: 'expenses',
      loadChildren: () => import('../expenses/expenses.module')
        .then(m => m.ExpensesModule),
    },

    {
      path: 'reports',
      loadChildren: () => import('../reports/reports.module')
        .then(m => m.ReportsModule),
    },
    {
      path: 'staff',
      loadChildren: () => import('../staff/staff.module')
        .then(m => m.StaffModule),
    },

    {
      path: 'error',
      loadChildren: () => import('../error-pages/error-pages.module')
        .then(m => m.ErrorPageModule),
    },
    {
      path: '',
      redirectTo: 'error',
      pathMatch: 'full',
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
