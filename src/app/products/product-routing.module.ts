import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/guards/auth-gaurd.component';
import { LoginGuard } from '../auth/guards/login-gaurd.component';
import { AddProductComponent } from './add-product/add-product.component';
import { AllProductsComponent } from './all-products/all-products.component';
import { AddInventoryComponent } from './add-inventory/add-inventory.component';
import { AllInventoryComponent } from './all-inventory/all-inventory.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all-products',
        component: AllProductsComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-product',
        component: AddProductComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'all-inventory',
        component: AllInventoryComponent,
        canActivate: [AuthGuard, LoginGuard]
      },
      {
        path: 'add-inventory',
        component: AddInventoryComponent,
        canActivate: [AuthGuard, LoginGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
