import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageData } from '../local-storage-data';
import { Token } from '../../auth/login-model';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  constructor(private localStorageData: LocalStorageData) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(this.addAuthenticationToken(request));
  }

  addAuthenticationToken(request: HttpRequest<any>) {
    const token: Token = this.localStorageData.tokenValue;
    return request.clone({
      setHeaders: {
        "X-auth-token": token.token,
        'Access-Control-Allow-Origin': '*'
      }
      , params: request.params
    })
  }
}