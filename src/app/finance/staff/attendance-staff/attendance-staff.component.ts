import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from "rxjs/operators";
import { StaffService } from "../staff.service";
import { SessionService } from '../../../session/session.service';
import { Component, Injectable, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';
import { settings } from '../../../demo/data';
import { formatDate } from '@angular/common';
import { StaffModel, DateDataModel } from '../staff.model';
import { NotificationsService } from '../../../shared/notifications-service';
import { HolidayService } from '../../holidays/holiday.service';
import { AttendanceDtoModel, AttendanceRequestModel } from '../../../shared/common.models';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { SessionModel } from '../../../session/session.model';
import { UtilsService } from '../../../shared/services/utils.service';
import { LoginModel } from '../../../auth/login-model';

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
  selector: 'app-attendance-staff',
  templateUrl: './attendance-staff.component.html',
  styleUrls: ['./attendance-staff.component.sass'],
  providers: [{
    provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
    useClass: SevenDayRangeSelectionStrategy
  }]
})

export class AttendanceStaffComponent implements OnInit {
  attendanceForm: FormGroup;
  staffs: StaffModel[] = [];
  daysName: string[] = [];
  dateDataArray: DateDataModel[] = [];
  showDateFormat: string;
  selectmap: Map<string, Map<number, boolean>> = new Map<string, Map<number, boolean>>();
  weeklyOffMap: Map<number, boolean> = new Map<number, boolean>();
  staffJoiningDateMap: Map<number, Date> = new Map<number, Date>();

  upcomingHolidays = [];
  minDate: Date;
  maxDate: Date;
  approvedDateList: string[] = [];
  spinnerButtonOptions: MatProgressButtonOptions;
  session: SessionModel;
  login: LoginModel;

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private staffService: StaffService,
    public _dateAdapter: DateAdapter<Date>,
    private notification: NotificationsService,
    private holidayService: HolidayService,
    private localStorageData: LocalStorageData,
    private commonLayout: CommonLayout,
  ) { }
  ngOnInit(): void {
    this.login = this.localStorageData.userValue;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.session = this.localStorageData.sessionValue;
    const currentDate = new Date();

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
    this.staffService.getAllActiveUsers(this.login.companyId, undefined).subscribe(staffs => {

      this.utilsService.getWeeklyOff().subscribe(data => data.forEach(element => {
        this.weeklyOffMap.set(element.weekDaysNumber, element.active);

        this.holidayService.getAllHolidays(this.session.id).subscribe(holidays => {
          holidays.forEach(holiday => {
            this.upcomingHolidays.push(holiday.holidayDate);
          });
          this.staffs = staffs;
          this.staffs.sort((a, b) => a.name.localeCompare(b.name));
          staffs.forEach(staff => {
            this.staffJoiningDateMap.set(staff.id, new Date(staff.dateOfJoining));
          });


          this.getDataOnDate(startDate, endDate);
        });
      }));
    });



    this.attendanceForm = this.fb.group({
      dateRange: this.fb.group({
        startDate: [startDate],
        endDate: [endDate]
      })
    });


  }



  toggle(event, staffId, date) {
    this.selectmap.get(date).set(staffId, event.checked);
    this.setIndeterminate(date);
  }

  isAllSelected(event) {
    for (const dateData of this.dateDataArray) {
      if (dateData.date == event.source.id) {
        const date = new Date(dateData.date);
        dateData.isSelected = event.checked;
        for (const staff of this.staffs) {
          if (this._dateAdapter.compareDate(date, this.staffJoiningDateMap.get(staff.id)) >= 0) {
            this.selectmap.get(dateData.date).set(staff.id, event.checked);
          }
        }
        break;
      }
    }
  }

  setIndeterminate(date: string) {
    for (const dateData of this.dateDataArray) {
      if (dateData.date == date) {
        let isAllSelected = true;
        let isAllNonSelected = true;
        for (const staff of this.staffs) {
          if (this.selectmap.get(dateData.date).get(staff.id)) {
            isAllNonSelected = false;
            break;
          }
        }

        for (const staff of this.staffs) {
          if (!this.selectmap.get(dateData.date).get(staff.id)) {
            isAllSelected = false;
            break;
          }
        }
        dateData.isSelected = isAllSelected;
        dateData.isIndeterminate = !(isAllNonSelected || isAllSelected);
      }
    }
  }

  onDateChange() {
    let startDate = this.attendanceForm.get('dateRange').get('startDate').value;
    let endDate = this.attendanceForm.get('dateRange').get('endDate').value;
    this.getDataOnDate(startDate, endDate);
  }

  getDataOnDate(startDate, endDate) {
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

    const startDateSaveFormat = formatDate(startDate, settings.SAVE_DATE_FORMAT, 'en');
    const endDateSaveFormat = formatDate(endDate, settings.SAVE_DATE_FORMAT, 'en');

    this.staffService.getApproveStaffAttendances(this.login.companyId, startDateSaveFormat, endDateSaveFormat).subscribe(data => {

      data.forEach(dateData => {
        this.approvedDateList.push(dateData.attendanceDate);
      })
    });

    this.staffService.getAllStaffAttendance(this.login.companyId, startDateSaveFormat, endDateSaveFormat).subscribe(data => {
      let dataMap = new Map<string, number[]>();
      this.selectmap.clear();
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

  onSubmit() {
    // this.spinnerButtonOptions.active = true;

    let attendanceDates: AttendanceRequestModel[] = [];
    for (let dateAttendanceData of this.selectmap.entries()) {
      let staffIds = [];
      for (let entry of dateAttendanceData[1]) {
        if (entry[1]) {
          staffIds.push(entry[0]);
        }
      }
      if (staffIds.length > 0) {
        let attendanceDataModel: AttendanceRequestModel = new AttendanceRequestModel();
        attendanceDataModel.attendanceDate = dateAttendanceData[0];
        attendanceDataModel.ids = staffIds;
        attendanceDates.push(attendanceDataModel);
      }
    }
    let staffAttendanceModel = new AttendanceDtoModel();
    staffAttendanceModel.startDate = formatDate(this.attendanceForm.get('dateRange').get('startDate').value, settings.SAVE_DATE_FORMAT, 'en');
    staffAttendanceModel.endDate = formatDate(this.attendanceForm.get('dateRange').get('endDate').value, settings.SAVE_DATE_FORMAT, 'en');
    staffAttendanceModel.companyId = this.login.companyId;
    staffAttendanceModel.attendanceDates = attendanceDates;

    this.staffService.addStaffAttendances(staffAttendanceModel)
      .pipe(first())
      .subscribe(
        data => {
          this.spinnerButtonOptions.active = false;
          this.notification.showSuccessNotification(
            'Add Record Successfully...!!!',
            'bottom'
          );
        });
  }

}
