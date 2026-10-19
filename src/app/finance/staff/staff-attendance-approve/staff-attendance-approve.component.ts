import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from "rxjs/operators";
import { StaffService } from "../staff.service";
import { Component, Injectable, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';
import { settings } from '../../../demo/data';
import { formatDate } from '@angular/common';
import { DateDataModel, StaffAttendanceApprovalModel, StaffModel } from '../staff.model';
import { NotificationsService } from '../../../shared/notifications-service';
import { HolidayService } from '../../holidays/holiday.service';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { SessionModel } from '../../../session/session.model';
import { LoginModel } from '../../../auth/login-model';
import { UtilsService } from '../../../shared/services/utils.service';

@Injectable()
export class SevenDayRangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {

  constructor(private _dateAdapter: DateAdapter<D>) {
    this._dateAdapter.getFirstDayOfWeek = () => { return 1; }
  }

  selectionFinished(date: D | null): DateRange<D> {
    return this._createFiveDayRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this._createFiveDayRange(activeDate);
  }

  private _createFiveDayRange(date: D | null): DateRange<D> {
    if (date) {
      const daysOfWeek = this._dateAdapter.getDayOfWeek(date);
      let start = this._dateAdapter.addCalendarDays(date, 1 - daysOfWeek);
      let end = this._dateAdapter.addCalendarDays(date, 7 - daysOfWeek);
      if (daysOfWeek == 0) {
        start = this._dateAdapter.addCalendarDays(date, daysOfWeek - 6);
        end = this._dateAdapter.addCalendarDays(date, daysOfWeek);
      }
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}

@Component({
  selector: 'app-staff-attendance-approve',
  templateUrl: './staff-attendance-approve.component.html',
  styleUrls: ['./staff-attendance-approve.component.sass'],
  providers: [{
    provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
    useClass: SevenDayRangeSelectionStrategy
  }]
})
export class StaffAttendanceApproveComponent implements OnInit {
  attendanceForm: FormGroup;
  staffs: StaffModel[] = [];
  daysName = [];
  dateDataArray: DateDataModel[] = [];
  showDateFormat: string;
  selectmap: Map<string, Map<number, boolean>> = new Map<string, Map<number, boolean>>();
  weeklyOffMap: Map<number, boolean> = new Map<number, boolean>();
  upcomingHolidays = [];
  minDate: Date;
  maxDate: Date;
  approvedDateList: string[] = [];
  login: LoginModel;
  spinnerButtonOptions: MatProgressButtonOptions;
  session: SessionModel;
  constructor(
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private staffsService: StaffService,
    public _dateAdapter: DateAdapter<Date>,
    private notification: NotificationsService,
    private holidayService: HolidayService,
    private localStorageData: LocalStorageData,
    private commonLayout: CommonLayout,
  ) { }
  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton("Approve All");
    this.login = this.localStorageData.userValue;
    const currentDate = new Date();
    this.session = this.localStorageData.sessionValue;
    this.minDate = new Date(this.session.fromDate);
    this.maxDate = new Date(this.session.toDate);

    if (this._dateAdapter.compareDate(this.maxDate, currentDate) > 0) {
      this.maxDate = currentDate;
    }

    this.showDateFormat = settings.SAVE_DATE_FORMAT;

    this._dateAdapter.getFirstDayOfWeek = () => { return 1; }


    this.daysName = this._dateAdapter.getDayOfWeekNames("short");
    const daysOfWeek = this._dateAdapter.getDayOfWeek(currentDate);
    const startDate = this._dateAdapter.addCalendarDays(currentDate, 1 - daysOfWeek);
    const endDate = this._dateAdapter.addCalendarDays(currentDate, 7 - daysOfWeek);

    const Difference_In_Days = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

    for (let i = 0; i < Difference_In_Days + 1; i++) {
      const loopDate = this._dateAdapter.addCalendarDays(startDate, i);
      this.dateDataArray.push({ isSelected: false, isIndeterminate: false, weekDay: this._dateAdapter.getDayOfWeek(loopDate), showDate: formatDate(loopDate, settings.SHOW_DATE_FORMAT, 'en'), date: formatDate(loopDate, settings.SAVE_DATE_FORMAT, 'en'), actualDate: loopDate, day: this.daysName[this._dateAdapter.getDayOfWeek(loopDate)] });
    }

    this.utilsService.getWeeklyOff()
      .subscribe(data => data.forEach(element => {
        this.weeklyOffMap.set(element.weekDaysNumber, element.active);

        for (const dateData of this.dateDataArray) {
          if (element.active && element.weekDaysNumber == dateData.weekDay) {
            this.approvedDateList.push(dateData.date);
          }
        }

      }));

    this.holidayService.getAllHolidays(this.session.id).subscribe(holidays => {
      holidays.forEach(holiday => {
        this.upcomingHolidays.push(holiday.holidayDate);
        for (const dateData of this.dateDataArray) {
          if (this.upcomingHolidays.indexOf(dateData.date) > -1) {
            this.approvedDateList.push(dateData.date);
          }
        }
      });
    });
    this.getStaffs(startDate, endDate);
    this.attendanceForm = this.fb.group({
      dateRange: this.fb.group({
        startDate: [startDate],
        endDate: [endDate]
      })
    });

  }

  toggle(date) {
    this.spinnerButtonOptions.active = true;

    const staffAttendanceApprovalModelList: StaffAttendanceApprovalModel[] = [];
    let staffAttendanceApprovalModel = new StaffAttendanceApprovalModel();
    staffAttendanceApprovalModel.approvedBy = this.login.id;
    staffAttendanceApprovalModel.attendanceDate = date;
    staffAttendanceApprovalModel.companyId = this.login.companyId;

    staffAttendanceApprovalModelList.push(staffAttendanceApprovalModel);

    this.staffsService.approveStaffAttendances(staffAttendanceApprovalModelList)
      .pipe(first())
      .subscribe(
        data => {
          this.spinnerButtonOptions.active = false;

          this.approvedDateList.push(date);
          this.notification.showSuccessNotification(
            'Attendance Approved Successfully...!!!',
            'bottom'
          );
        });

  }

  onDateChange() {
    let startDate = this.attendanceForm.get('dateRange').get('startDate').value;
    let endDate = this.attendanceForm.get('dateRange').get('endDate').value;

    this.selectmap.clear();
    const Difference_In_Days = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    this.dateDataArray = [];
    this.approvedDateList = [];
    for (let i = 0; i < Difference_In_Days + 1; i++) {
      const loopDate = this._dateAdapter.addCalendarDays(startDate, i);
      this.dateDataArray.push({ isSelected: false, isIndeterminate: false, weekDay: this._dateAdapter.getDayOfWeek(loopDate), showDate: formatDate(loopDate, settings.SHOW_DATE_FORMAT, 'en'), actualDate: loopDate, date: formatDate(loopDate, settings.SAVE_DATE_FORMAT, 'en'), day: this.daysName[this._dateAdapter.getDayOfWeek(loopDate)] });

      if (this.weeklyOffMap.get(this._dateAdapter.getDayOfWeek(loopDate)) && this.weeklyOffMap.get(this._dateAdapter.getDayOfWeek(loopDate)) == true) {
        this.approvedDateList.push(formatDate(loopDate, settings.SAVE_DATE_FORMAT, 'en'));
      } else if (this.upcomingHolidays.indexOf(formatDate(loopDate, settings.SAVE_DATE_FORMAT, 'en')) > -1) {
        this.approvedDateList.push(formatDate(loopDate, settings.SAVE_DATE_FORMAT, 'en'));
      }
    }

    const staffs = this.staffs;
    this.staffs = [];
    startDate = formatDate(this.attendanceForm.get('dateRange').get('startDate').value, settings.SAVE_DATE_FORMAT, 'en');
    endDate = formatDate(this.attendanceForm.get('dateRange').get('endDate').value, settings.SAVE_DATE_FORMAT, 'en');


    this.staffsService.getApproveStaffAttendances(this.login.companyId, startDate, endDate).subscribe(data => {

      data.forEach(dateData => {
        this.approvedDateList.push(dateData.attendanceDate);
      })
    });

    this.staffsService.getAllStaffAttendance(this.login.companyId, startDate, endDate).subscribe(data => {
      this.staffs = staffs;
      this.staffs.sort((a, b) => a.name.localeCompare(b.name));
      let dataMap = new Map<string, number[]>();
      for (const attendanceData of data.attendanceDates) {
        dataMap.set(attendanceData.attendanceDate, attendanceData.ids);
      }

      for (const dateData of this.dateDataArray) {
        let staffIds = dataMap.get(dateData.date) != null ? dataMap.get(dateData.date) : [];
        const datemap = new Map<number, boolean>();
        dateData.isSelected = this.staffs.length > 0 && this.staffs.length == staffIds.length;
        dateData.isIndeterminate = staffIds.length > 0 && this.staffs.length !== staffIds.length;
        for (const staff of this.staffs) {
          datemap.set(staff.id, staffIds.indexOf(staff.id) > -1);
        }
        this.selectmap.set(dateData.date, datemap);
      }
    });

  }

  getStaffs(startDate, endDate) {
    startDate = formatDate(startDate, settings.SAVE_DATE_FORMAT, 'en');
    endDate = formatDate(endDate, settings.SAVE_DATE_FORMAT, 'en');
    this.approvedDateList = [];
    this.staffsService.getApproveStaffAttendances(this.login.companyId, startDate, endDate).subscribe(data => {

      data.forEach(dateData => {
        this.approvedDateList.push(dateData.attendanceDate);
      });
    });

    for (const dateData of this.dateDataArray) {
      if (this.weeklyOffMap.get(dateData.weekDay) && this.weeklyOffMap.get(dateData.weekDay) == true) {
        this.approvedDateList.push(dateData.date);
      } else if (this.upcomingHolidays.indexOf(dateData.date) > -1) {
        this.approvedDateList.push(dateData.date);
      }
    }

    this.staffs = [];
    this.staffsService.getAllActiveUsers(this.login.companyId, undefined).subscribe(data => {
      const staffs = data;


      this.staffsService.getAllStaffAttendance(this.login.companyId, startDate, endDate).subscribe(data => {
        this.staffs = staffs;
        this.staffs.sort((a, b) => a.name.localeCompare(b.name));
        this.selectmap.clear();

        let dataMap = new Map<string, number[]>();
        for (const attendanceData of data.attendanceDates) {
          dataMap.set(attendanceData.attendanceDate, attendanceData.ids);
        }

        for (const dateData of this.dateDataArray) {
          let staffIds = dataMap.get(dateData.date) != null ? dataMap.get(dateData.date) : [];
          const datemap = new Map<number, boolean>();
          dateData.isSelected = this.staffs.length > 0 && this.staffs.length == staffIds.length;
          dateData.isIndeterminate = staffIds.length > 0 && this.staffs.length !== staffIds.length;
          for (const staff of this.staffs) {
            datemap.set(staff.id, staffIds.indexOf(staff.id) > -1);
          }
          this.selectmap.set(dateData.date, datemap);
        }
      });
    });
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;


    const staffAttendanceApprovalModelList: StaffAttendanceApprovalModel[] = [];
    for (const dateData of this.dateDataArray) {

      if (this.approvedDateList.indexOf(dateData.date) == -1) {

        let staffAttendanceApprovalModel = new StaffAttendanceApprovalModel();
        staffAttendanceApprovalModel.approvedBy = this.login.id;
        staffAttendanceApprovalModel.attendanceDate = dateData.date;
        staffAttendanceApprovalModelList.push(staffAttendanceApprovalModel);
      }
    }

    this.staffsService.approveStaffAttendances(staffAttendanceApprovalModelList)
      .pipe(first())
      .subscribe(
        data => {
          this.spinnerButtonOptions.active = false;
          this.approvedDateList = [];
          for (const dateData of this.dateDataArray) {
            this.approvedDateList.push(dateData.date);
          }
          this.notification.showSuccessNotification(
            'All Attendances Approved Successfully...!!!',
            'bottom'
          );
        });
  }


}
