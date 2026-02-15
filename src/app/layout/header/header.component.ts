import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  AfterViewInit,
} from '@angular/core';
import { RightSidebarService } from '../../shared/services/rightsidebar.service';
import { ConfigService } from '../../shared/services/config.service';
import { Router } from '@angular/router';
import { CompanyService } from '../../company-settings/company.service';
import { NotificationService } from '../../notification/notification.service';
import { Subject, Subscription, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanyModel } from '../../company-settings/company.model';
import { NotificationResponseModel } from '../../notification/notification.model';
import { AuthService } from '../../auth/auth.service';
import { environment } from '@environments/environment';
import { LocalStorageData } from '../../shared/local-storage-data';
import { LoginModel } from '../../auth/login-model';
import { FormControl } from '@angular/forms';

const document: any = window.document;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
})

export class HeaderComponent implements OnInit, AfterViewInit {
  public config: any = {};
  company: CompanyModel;
  notifications: NotificationResponseModel[] = [];
  timerSubscription: Subscription;
  login: LoginModel;
  apiURL: string = environment.apiUrl;
  observer = new Subject();
  public subscriber$ = this.observer.asObservable();
  isStaff: boolean = true;
  uploadImg: string;
  homeLink: string;
  search = new FormControl('');

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private dataService: RightSidebarService,
    private configService: ConfigService,
    private router: Router,
    private companyService: CompanyService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private localStorageData: LocalStorageData,

  ) { }

  ngOnInit() {
    this.login = this.localStorageData.userValue;

    if (!this.login) {
      this.login = this.localStorageData.customerValue;
      this.uploadImg = this.login.uploadImg ? this.apiURL + this.login.uploadImg : this.login.gender == 1 ? "assets/images/user/male_customer_avatar.png" : "assets/images/user/female_customer_avatar.png";
      this.isStaff = false;
      this.homeLink = '/pages/dashboard/customer-dashboard';

    } else {
      this.uploadImg = this.login.uploadImg ? this.apiURL + this.login.uploadImg : this.login.gender == 1 ? "assets/images/user/male_teacher_avatar.png" : "assets/images/user/female_teacher_avatar.png";
      this.homeLink = '/pages/dashboard/staff-dashboard';
    }

    this.timerSubscription = timer(0, 1000 * 60 * 10).pipe(
      map(() => {
        if (this.isStaff) {
          this.notificationService.getNotificationDetailsLimit(undefined, this.login.id).subscribe((data) => {
            this.notifications = data;
          });
        } else {
          this.notificationService.getNotificationDetailsLimit(this.login.id, undefined).subscribe((data) => {
            this.notifications = data;
          });

        }
      })
    ).subscribe();

    this.notificationService.subscriber$.subscribe(data => {
      data.forEach((key) => {
        const foundIndex = this.notifications.findIndex((x) => x.notification.id === key);
        this.notifications.splice(foundIndex, 1);
      });
    });


    this.localStorageData.staffSubscriber$.subscribe(data => {
      this.login = data;
      this.uploadImg = this.login.uploadImg ? this.apiURL + this.login.uploadImg : this.login.gender == 1 ? "assets/images/user/male_teacher_avatar.png" : "assets/images/user/female_teacher_avatar.png";
    });

    this.localStorageData.customerSubscriber$.subscribe(data => {
      this.login = data;
      this.uploadImg = this.login.uploadImg ? this.apiURL + this.login.uploadImg : this.login.gender == 1 ? "assets/images/user/male_customer_avatar.png" : "assets/images/user/female_customer_avatar.png";

    });

    this.companyService.subscriber$.subscribe(data => {
      this.company = data;
    });

    this.companyService.getCompanyDetails().subscribe(
      (companyModel) => {
        if (companyModel == undefined) {
          companyModel = new CompanyModel({});
        }
        this.company = companyModel;
      }
    );

    this.config = this.configService.configData;
  }

  updateUrl(event) {
    event.target.src = this.login.gender == 1 ? "assets/images/user/male_teacher_avatar.png" : "assets/images/user/female_teacher_avatar.png";
  }

  viewStaffProfile() {
    if (this.isStaff) {
      this.router.navigateByUrl('pages/staff/about-staff', { state: { staff: this.login, action: 'view' } });
    } else {
      this.router.navigateByUrl('pages/customers/view-profile');

    }
  }

  changePassword() {
    if (this.isStaff) {
      this.router.navigateByUrl('pages/staff/changePassword');
    }
  }

  redirectToSearch() {
    this.router.navigateByUrl('pages/dashboard/search-people', { state: { search: this.search.value } });
    this.search.setValue('');
  }

  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    // set theme on startup
    if (localStorage.getItem('theme')) {
      this.renderer.removeClass(this.document.body, this.config.layout.variant);
      this.renderer.addClass(this.document.body, localStorage.getItem('theme'));
    } else {
      this.renderer.addClass(this.document.body, this.config.layout.variant);
    }

    if (localStorage.getItem('menuOption')) {
      this.renderer.addClass(this.document.body, localStorage.getItem('menuOption'));
    } else {
      this.renderer.addClass(this.document.body, 'menu_' + this.config.layout.sidebar.backgroundColor);
    }

    if (localStorage.getItem('choose_logoheader')) {
      this.renderer.addClass(this.document.body, localStorage.getItem('choose_logoheader'));
    } else {
      this.renderer.addClass(this.document.body, 'logo-' + this.config.layout.logo_bg_color);
    }

    if (localStorage.getItem('sidebar_status')) {
      if (localStorage.getItem('sidebar_status') == "close") {
        this.renderer.addClass(this.document.body, 'side-closed');
        this.renderer.addClass(this.document.body, 'submenu-closed');
      } else {
        this.renderer.removeClass(this.document.body, 'side-closed');
        this.renderer.removeClass(this.document.body, 'submenu-closed');
      }
    } else {
      if (this.config.layout.sidebar.collapsed == true) {
        this.renderer.addClass(this.document.body, 'side-closed');
        this.renderer.addClass(this.document.body, 'submenu-closed');
      }
    }

  }
  callFullscreen() {
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }
  mobileMenuSidebarOpen(event: any, className: string) {
    const hasClass = event.target.classList.contains(className);
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }
  callSidemenuCollapse() {
    const hasClass = this.document.body.classList.contains('side-closed');
    if (hasClass) {
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }
  public toggleRightSidebar(): void {
    this.dataService.changeMsg(
      (this.dataService.currentStatus._isScalar = !this.dataService
        .currentStatus._isScalar)
    );
  }

  logout() {
    this.authService.logout();
  }
}
