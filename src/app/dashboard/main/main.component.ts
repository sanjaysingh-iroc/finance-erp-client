import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '@environments/environment';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartComponent
} from 'ng-apexcharts';
import { AnnouncementModel } from '../../announcement/announcement.model';
import { AnnouncementService } from '../../announcement/announcement.service';
import { monthMap, settings, weekMap } from '../../demo/data';
import { HolidayModel } from '../../holidays/holiday.model';
import { HolidayService } from '../../holidays/holiday.service';
import { FullName, SettingModel } from '../../shared/common.models';
import { LocalStorageData } from '../../shared/local-storage-data';
import { SessionService } from '../../session/session.service';
import { StaffModel } from '../../staff/staff.model';
import { StaffService } from '../../staff/staff.service';
import { CommonServices } from '../../shared/services/common-services';
import { DashboardService } from '../dashboard.service';
import { LoginModel } from '../../auth/login-model';
import { UtilsService } from '../../shared/services/utils.service';
import { CustomerLeadService } from '../../customer-lead/customer-lead.service';
import { CustomerLeadModel } from '../../customer-lead/customer-lead.model';
import { formatDate } from '@angular/common';

// declare const $: any;
export type areaChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  colors: string[];
};

export type barChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  colors: string[];
};

@Component({
  selector: 'pages-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass']
})
export class MainComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent;

  birthdayStaff: StaffModel[] = [];
  upcomingHolidays: HolidayModel[] = [];
  announcementList: AnnouncementModel[] = [];

  apiURL: string = environment.apiUrl;
  weekMap: Map<number, FullName> = weekMap;
  monthMap: Map<number, FullName> = monthMap;
  monthList: FullName[] = [];
  currency = settings.CURRENCY;

  weeklyOffMap: Map<number, boolean> = new Map<number, boolean>();

  settingModels: SettingModel[] = [];

  activeWeekday: Map<number, string> = new Map([
    [0, ''],
    [1, ''],
    [2, ''],
    [3, ''],
    [4, ''],
    [5, ''],
    [6, '']
  ]);

  public pieChartType = 'pie';
  public pieChartColors: any[] = [
    {
      backgroundColor: ['#60A3F6', '#7C59E7', '#DD6811', '#5BCFA5']
    }
  ];
  public pieChartOptions: any = {
    animation: false,
    responsive: true,
    legend: {
      display: true,
      labels: {
        fontColor: '#9aa0ac'
      }
    },
  };

  public staffPieChartLabels: string[] = [];
  public staffPieChartData: number[] = [];
  login: LoginModel;
  dashboardAclModels: number[] = [];
  allCustomerLeadModels: CustomerLeadModel[];
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();

  constructor(
    private staffService: StaffService,
    private sessionService: SessionService,
    private utilsService: UtilsService,
        private customerLeadService: CustomerLeadService,
    
    private holidayService: HolidayService,
    private announcementService: AnnouncementService,
    private dashboardService: DashboardService,
    private localStorageData: LocalStorageData,
  ) { }

  ngOnInit(): void {
    const session = this.localStorageData.sessionValue;
    this.settingModels = this.localStorageData.settingValues;
    this.login = this.localStorageData.userValue;

    if (this.login.userType != 1) {
      this.dashboardService.getAllDashboardAclDetails(this.login.userType).subscribe(data => {
        data.forEach((dashboardAclModel) => {
          this.dashboardAclModels.push(dashboardAclModel.dashboardId);
        });
        this.setDashBoardData(session);
      });
    } else {
      this.setDashBoardData(session);
    }
  }

  setDashBoardData(session) {

    const minDate = new Date();

    this.activeWeekday.set(minDate.getDay(), 'active');
    this.utilsService.getWeeklyOff().subscribe(data => data.forEach(element => {
      this.weeklyOffMap.set(element.weekDaysNumber, element.active);
      if (element.active) {
        this.weekMap.delete(element.weekDaysNumber);
      }
    }));

    this.customerLeadService.getAllCustomerLeadDetailsByDate(formatDate(new Date, settings.SAVE_DATE_FORMAT, 'en')).subscribe(data => {
      this.allCustomerLeadModels = data;
    });

    this.staffService.getAllUsers().subscribe(data => {
      data.forEach(staffModel => this.staffMap.set(staffModel.id, staffModel));
    });


    if (this.login.userType == 1 || this.dashboardAclModels.indexOf(5) > -1) {
      this.staffService.getBirthdayStaff(session.id).subscribe(birthdayStaff => {
        this.birthdayStaff = birthdayStaff;
      });
    }

    if (this.login.userType == 1 || this.dashboardAclModels.indexOf(12) > -1) {
      this.announcementService.getAllActiveAnnouncements().subscribe(data => {
        this.announcementList = data;
      });
    }


    if (this.login.userType == 1 || this.dashboardAclModels.indexOf(6) > -1) {
      this.holidayService.getAllUpcomimgHolidays(session.id).subscribe(upcomingHolidays => {
        this.upcomingHolidays = upcomingHolidays;
      });
    }

  }



  updateCustomerUrl(event, row) {
    event.target.src = row.customer.gender == 1 ? 'assets/images/user/male_customer_avatar.png' : 'assets/images/user/female_customer_avatar.png';
  }

  updateStaffUrl(event, row) {
    event.target.src = row.gender == 1 ? "assets/images/user/male_teacher_avatar.png" : "assets/images/user/female_teacher_avatar.png";
  }

}
