import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import{ Page404Component} from './page404/page404.component';
import{ Page500Component} from './page500/page500.component';
import { ErrorPageRoutingModule } from './error-pages-routing.module';
import { Page401Component } from './page401/page401.component';

@NgModule({
  declarations: [Page401Component, Page404Component, Page500Component],
  imports: [
    CommonModule,
    ErrorPageRoutingModule
  ]
})
export class ErrorPageModule { }
