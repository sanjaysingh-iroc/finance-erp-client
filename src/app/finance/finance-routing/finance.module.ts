import { NgModule } from '@angular/core';

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
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { FinanceRoutingComponent } from './finance-routing.component';
import { PagesRoutingModule } from './finance-routing.module';

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
    FinanceRoutingComponent,
  ],

})
export class FinanceModule {
}
