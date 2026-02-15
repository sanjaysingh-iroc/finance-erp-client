import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../session/session.service';

import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { Utils } from '../../shared/util-class';
// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';
import { HolidayService } from '../../holidays/holiday.service';
import { ExcelExportService } from '../../shared/excelExport/excelExport-service';
import { PdfService } from '../../shared/pdfServices/pdfExport';
import { LocalStorageData } from '../../shared/local-storage-data';
import { StaffModel } from '../../staff/staff.model';
import { StaffService } from '../../staff/staff.service';
import { monthMap } from '../../demo/data';
import { SessionModel } from '../../session/session.model';
import { UtilsService } from '../../shared/services/utils.service';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-staff-attendance',
  templateUrl: './staff-attendance.component.html',
  styleUrls: ['./staff-attendance.component.sass'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class StaffAttendanceComponent implements OnInit {

  staffs: StaffModel[] = [];
  daysName = [];
  showDateFormat: string;
  weeklyOffMap: Map<number, boolean> = new Map<number, boolean>();
  holidayMap: Map<number, string> = new Map<number, string>();
  date = new FormControl(moment());
  session: SessionModel;
  noOfDays = [];
  staffAttendanceMap: Map<number, Map<number, string>> = new Map<number, Map<number, string>>();
  dateWiseData: Map<number, number> = new Map<number, number>();
  totalPresent = 0;
  minDate: Date;
  maxDate: Date;

  constructor(
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private staffService: StaffService,
    private holidayService: HolidayService,
    public _dateAdapter: DateAdapter<Date>,
    private utils: Utils,
    private pdfService: PdfService,
    private excelExportService: ExcelExportService,
    private localStorageData: LocalStorageData,

  ) { }
  ngOnInit(): void {
    this.session = this.localStorageData.sessionValue;
    const currentDate = new Date();
    this.minDate = new Date(this.session.fromDate);
    this.maxDate = new Date(this.session.toDate);
    if (this.utils.getDateAdaptor().compareDate(this.maxDate, currentDate) > 0) {
      this.maxDate = currentDate;
    }

    this.staffs = [];
    this.staffService.getAllActiveUsers(this.session.id, undefined).subscribe(staffs => {
      this.staffs = staffs;
      this.staffs.sort((a, b) => a.name.localeCompare(b.name));
      this.getHolidayData();
      this.getStaffAttendances();
    });

    this.utilsService.getWeeklyOff()
      .subscribe(data => data.forEach(element => this.weeklyOffMap.set(element.weekDaysNumber, element.active)));

  }

  generatePDF(action = 'open') {
    let data: string[][] = this.getExportData();
    this.pdfService.generatePDF('Staffs Attendance', [], data, { alignment: 'center', margin: [0, 5, 0, 15] }, 'landscape', action, 1);
  }

  private getHeaderCaption() {
    let headerCaption: any[] = [];
    headerCaption.push({ text: 'Name', style: 'subheaderBold' });
    for (let cal of this.noOfDays) {
      headerCaption.push({ text: cal.day + '', style: 'subheaderBold' });

    }
    headerCaption.push({ text: 'Total', style: 'subheaderBold' });
    return headerCaption;
  }

  exportExcel() {
    let s = this.getHeaderCaption();

    let columns = [];
    s.forEach(caption => {
      columns.push({ header: caption.text, key: caption.text, width: 4 });
    });
    columns[1].width = 30;
    columns[columns.length - 1].width = 10;
    let data = [];
    this.staffs.map(staff => {
      let row = [];
      row.push(staff.name);
      for (let cal of this.noOfDays) {
        row.push(this.staffAttendanceMap.get(staff.id) && this.staffAttendanceMap.get(staff.id).get(cal.day) ? this.staffAttendanceMap.get(staff.id).get(cal.day) : this.weeklyOffMap.get(cal.dayOfWeek) ? 'WO' : this.holidayMap.get(cal.day) ? 'PH' : 'A');
      }
      row.push((this.staffAttendanceMap.get(staff.id) ? this.staffAttendanceMap.get(staff.id).size : 0).toString());
      data.push(row);
    });
    let row = [];

    row.push('Total');
    for (let cal of this.noOfDays) {
      row.push((this.dateWiseData.get(cal.day) ? this.dateWiseData.get(cal.day) : 0).toString());
    }
    row.push(this.totalPresent.toString());
    data.push(row);
    this.excelExportService.exportExcel(columns, data, monthMap.get(this.date.value.month() + 1).full + " Staff Attendance", "StaffAttendance");
  }

  private getExportData() {

    let data = [];
    data.push(this.getHeaderCaption());
    this.staffs.map(staff => {
      let row = [];
      row.push(staff.name);
      for (let cal of this.noOfDays) {
        row.push({ text: this.staffAttendanceMap.get(staff.id) && this.staffAttendanceMap.get(staff.id).get(cal.day) ? this.staffAttendanceMap.get(staff.id).get(cal.day) : this.weeklyOffMap.get(cal.dayOfWeek) ? 'WO' : this.holidayMap.get(cal.day) ? 'PH' : 'A', style: 'subheader' });
      }
      row.push({ text: (this.staffAttendanceMap.get(staff.id) ? this.staffAttendanceMap.get(staff.id).size : 0).toString(), style: 'subheader' });
      data.push(row);
    });
    let row = [];

    row.push({ text: 'Total', style: 'tableHeader' });
    for (let cal of this.noOfDays) {
      row.push({ text: (this.dateWiseData.get(cal.day) ? this.dateWiseData.get(cal.day) : 0).toString(), style: 'tableHeader' });
    }
    row.push({ text: this.totalPresent.toString(), style: 'tableHeader' });
    data.push(row);
    return data;
  }


  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
    this.getHolidayData();
    this.getStaffAttendances();
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();
    this.getHolidayData();
    this.getStaffAttendances();
  }

  getStaffAttendances() {
    this.staffService.getAllStaffAttendanceByMonthAndYear(this.date.value.month() + 1, this.date.value.year()).subscribe(data => {
      this.staffAttendanceMap.clear();
      this.dateWiseData.clear();
      data.forEach(attendance => {
        let dateData = this.staffAttendanceMap.get(attendance.staffId);
        if (!dateData) {
          dateData = new Map<number, string>();
        }
        const days = new Date(attendance.attendanceDate).getDate();
        dateData.set(days, 'P');
        this.dateWiseData.set(days, this.dateWiseData.get(days) ? this.dateWiseData.get(days) + 1 : 1);

        this.staffAttendanceMap.set(attendance.staffId, dateData);
      });
      this.totalPresent = data.length;
    });
  }

  getHolidayData() {
    this.holidayService.getAllHolidaysByMonthAndYear(this.date.value.month() + 1, this.date.value.year()).subscribe(data => {
      this.holidayMap.clear();
      data.forEach(holiday => this.holidayMap.set(new Date(holiday.holidayDate).getDate(), 'PH'));
    });

    const noOfDays = new Date(this.date.value.year(), this.date.value.month() + 1, 0).getDate();
    this.noOfDays = [];
    for (let i = 1; i <= noOfDays; i++) {
      var d = new Date(this.date.value.year() + "-" + (this.date.value.month() + 1) + "-" + i);
      this.noOfDays.push({ day: i, dayOfWeek: d.getDay() });
    }

  }

}
