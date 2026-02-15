import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { HeaderComponent } from '../layout/header/header.component';
import { PageLoaderComponent } from '../layout/page-loader/page-loader.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { RightSidebarComponent } from '../layout/right-sidebar/right-sidebar.component';
import { HttpClientModule } from '@angular/common/http';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ClickOutsideModule } from 'ng-click-outside';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { CustomMaterialModule } from '../custom-material/custom-material.module';

@NgModule({
  imports: [
    PagesRoutingModule,
    CustomMaterialModule,
    HttpClientModule,
    PerfectScrollbarModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    NgxSpinnerModule,
    ClickOutsideModule
  ],
  declarations: [
    PagesComponent,
    HeaderComponent,
    PageLoaderComponent,
    SidebarComponent,
    RightSidebarComponent,
  ],
 
})
export class PagesModule {
}
