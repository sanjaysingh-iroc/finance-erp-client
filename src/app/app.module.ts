import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ConfigService } from './shared/services/config.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import {
  PerfectScrollbarModule,
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
} from 'ngx-perfect-scrollbar';
import { NgxMaskModule } from 'ngx-mask';
import { ClickOutsideModule } from 'ng-click-outside';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { HeaderInterceptor } from './shared/request/HeaderInterceptor';
import { RightSidebarService } from './shared/services/rightsidebar.service';
import { CustomMaterialModule } from './custom-material/custom-material.module';
import { DeleteDialogComponent } from './shared/dialog/delete/delete.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  // suppressScrollX: true,
  // suppressScrollY: true,
  wheelPropagation: true,
};

@NgModule({
  declarations: [
    AppComponent,
    DeleteDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    CustomMaterialModule,
    HttpClientModule,
    PerfectScrollbarModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    NgxSpinnerModule,
    ClickOutsideModule,
    NgxMaskModule.forRoot(),
    
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeaderInterceptor,
      multi: true
    },
    // DynamicScriptLoaderService,
    ConfigService,
    RightSidebarService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
