import { Component } from '@angular/core';
import {
  Event,
  Router,
  NavigationStart,
  NavigationEnd,
} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentUrl: string;
  constructor(public router: Router, location: PlatformLocation, private spinner: NgxSpinnerService) {

    window.addEventListener('storage', (event) => {
      if (event.storageArea == localStorage) {
        let token = window.localStorage.getItem('logged_in');
        if (token == 'false' || token == 'true') {
        localStorage.removeItem("logged_in");
        window.location.reload();
        }
      }
    }, false);

   
    this.router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.spinner.show();
        location.onPopState(() => {
          window.location.reload();
        });
        this.currentUrl = routerEvent.url.substring(
          routerEvent.url.lastIndexOf('/') + 1
        );
      }
      if (routerEvent instanceof NavigationEnd) {
        this.spinner.hide();
      }
      window.scrollTo(0, 0);
    });
  }
}
