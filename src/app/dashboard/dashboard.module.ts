import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MainComponent } from './main/main.component';
import { CustomMaterialModule } from '../custom-material/custom-material.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartsModule as chartjsModule } from 'ng2-charts';
import { MorrisJsModule } from 'angular-morris-js';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GaugeModule } from 'angular-gauge';
import { SearchPeopleComponent } from './search-people/search-people.component';
import { DashboardAclComponent } from './dashboard-acl/dashboard-acl.component';
import {
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
@NgModule({
  declarations: [MainComponent, SearchPeopleComponent, DashboardAclComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    CustomMaterialModule,
    NgxEchartsModule,
    chartjsModule,
    MorrisJsModule,
    NgxChartsModule,
    NgApexchartsModule,
    PerfectScrollbarModule,
    GaugeModule.forRoot()
  ]
})
export class DashboardModule { }
