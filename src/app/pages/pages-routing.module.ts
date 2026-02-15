import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';

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
      path: 'staff',
      loadChildren: () => import('../staff/staff.module')
        .then(m => m.StaffModule),
    },

    {
      path: 'announcement',
      loadChildren: () => import('../announcement/announcement.module')
        .then(m => m.AnnouncementModule),
    },
    {
      path: 'session',
      loadChildren: () => import('../session/session.module')
        .then(m => m.SessionModule),
    },

    {
      path: 'notification',
      loadChildren: () => import('../notification/notification.module')
        .then(m => m.NotificationModule),
    },
    {
      path: 'holidays',
      loadChildren: () => import('../holidays/holiday.module')
        .then(m => m.HolidaysModule),
    },
    {
      path: 'products',
      loadChildren: () => import('../products/product.module')
        .then(m => m.ProductsModule),
    },
    {
      path: 'vendors',
      loadChildren: () => import('../vendors/vendor.module')
        .then(m => m.VendorModule),
    },
    {
      path: 'customers',
      loadChildren: () => import('../customers/customer.module')
        .then(m => m.CustomerModule),
    },
    {
      path: 'billings',
      loadChildren: () => import('../billing/billing.module')
        .then(m => m.BillingModule),
    },
    {
      path: 'company',
      loadChildren: () => import('../company-settings/company-settings.module')
        .then(m => m.CompanyDetailsModule),
    },
    {
      path: 'reports',
      loadChildren: () => import('../reports/reports.module')
        .then(m => m.ReportsModule),
    },
     {
      path: 'documents',
      loadChildren: () => import('../documents/documents.module')
        .then(m => m.DocumentsModule),
    },

    {
      path: 'expenses',
      loadChildren: () => import('../expenses/expenses.module')
        .then(m => m.ExpensesModule),
    },
    {
      path: 'customerLead',
      loadChildren: () => import('../customer-lead/customer-lead.module')
        .then(m => m.CustomerLeadModule),
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
