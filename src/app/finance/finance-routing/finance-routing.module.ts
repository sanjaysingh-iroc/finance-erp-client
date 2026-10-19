import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FinanceRoutingComponent } from './finance-routing.component';

const routes: Routes = [{
  path: '',
  component: FinanceRoutingComponent,
  children: [
    {
      path: 'announcement',
      loadChildren: () => import('../announcement/announcement.module')
        .then(m => m.AnnouncementModule),
    },
    {
      path: 'billings',
      loadChildren: () => import('../billing/billing.module')
        .then(m => m.BillingModule),
    },
    {
      path: 'customerLead',
      loadChildren: () => import('../customer-lead/customer-lead.module')
        .then(m => m.CustomerLeadModule),
    },
    {
      path: 'customers',
      loadChildren: () => import('../customers/customer.module')
        .then(m => m.CustomerModule),
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
      path: 'vendors',
      loadChildren: () => import('../vendors/vendor.module')
        .then(m => m.VendorModule),
    },
    {
      path: 'solar',
      loadChildren: () => import('../solar/solar-billing.module')
        .then(m => m.SolarModule),
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
