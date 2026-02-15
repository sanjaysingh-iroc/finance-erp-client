import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyRoutingModule } from './company-routing.module';
import { CustomMaterialModule } from '../custom-material/custom-material.module';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { AclSettingsComponent } from './acl-settings/acl-settings.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxMaskModule } from 'ngx-mask';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
@NgModule({
  declarations: [CompanyDetailsComponent, AclSettingsComponent],
  imports: [
    CommonModule,
    CompanyRoutingModule,
    CustomMaterialModule,
    NgxMaterialTimepickerModule,
    NgxMaskModule,
    PerfectScrollbarModule
  ]
})
export class CompanyDetailsModule { }
