import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LoginComponent } from './login/login.component';

import {CustomMaterialModule} from '../custom-material/custom-material.module';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { AuthRoutingModule } from './auth-routing.module';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [LoginComponent, ForgetPasswordComponent],
  providers: [DatePipe],
  imports: [
    CommonModule,
    CustomMaterialModule,
    AuthRoutingModule,
    NgxMaskModule,
  ]
})
export class AuthModule { }
