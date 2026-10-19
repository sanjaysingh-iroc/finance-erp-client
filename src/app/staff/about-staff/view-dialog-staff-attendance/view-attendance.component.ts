import { Component, Inject, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Calendar } from '../../../shared/models/calendar.model';
import { formatDate } from '@angular/common';
import { settings } from '../../../demo/data';
import { SessionService } from '../../../session/session.service';
import { DateAdapter } from '@angular/material/core';
import { StaffService } from '../../staff.service';
import { UtilsService } from '../../../shared/services/utils.service';

@Component({
  selector: 'app-view-attendance',
  templateUrl: './view-attendance.component.html',
  styleUrls: ['./view-attendance.component.sass']
})
export class DialogViewAttendanceComponent implements OnInit {


  @ViewChild('calendar', { static: false })
  calendar: Calendar | null;
  filterOptions = "All";
  startDate: string;
  endDate: string;
  weeklyOffMap: Map<number, boolean> = new Map<number, boolean>();
  upcomingHolidays: Map<string, string> = new Map<string, string>();
  calendarVisible = true;
  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin];
  calendarWeekends = true;
  @ViewChild('callAPIDialog', { static: false }) callAPIDialog: TemplateRef<any>;
  calendarEvents: EventInput[] = [];
  todaysEvents: EventInput[];

  constructor(
    public dialogRef: MatDialogRef<DialogViewAttendanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private staffService: StaffService,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    public _dateAdapter: DateAdapter<Date>,
  ) {
    this.calendar = new Calendar({});
  }

  public ngOnInit(): void {

    this.utilsService.getWeeklyOff()
      .subscribe(data => data.forEach(element => {
        this.weeklyOffMap.set(element.weekDaysNumber, element.active);
      }));

    this._dateAdapter.getFirstDayOfWeek = () => { return 1; }

    const date1: Date = new Date(this.data.year, this.data.month - 1, 1);
    const date2: Date = new Date(date1);
    date2.setMonth(date2.getMonth() + 1);
    this.startDate = formatDate(date1, settings.SAVE_DATE_FORMAT, 'en');
    this.endDate = formatDate(date2, settings.SAVE_DATE_FORMAT, 'en');
    const diffDays: number = (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
    date2.setDate(date2.getDate() - 1);

    const presents = [];
    this.staffService.getStaffApprovedAttendances(this.data.staffId, formatDate(date1, settings.SAVE_DATE_FORMAT, 'en'), formatDate(date2, settings.SAVE_DATE_FORMAT, 'en')).subscribe(element => {

      element.forEach(attendance => {
        const date = new Date(attendance.attendanceDate);
        presents.push(date.getDate());

        if (this.weeklyOffMap.get(this._dateAdapter.getDayOfWeek(date))) {
          this.calendarEvents = this.calendarEvents.concat({
            id: "event1",
            title: "Weekly-OFF",
            start: attendance.attendanceDate,
            className: "fc-event-warning",
            groupId: "work",
            details: "Weekly-OFF",
          });

        } else if (this.upcomingHolidays.get(attendance.attendanceDate)) {
          this.calendarEvents = this.calendarEvents.concat({
            id: "event1",
            title: this.upcomingHolidays.get(attendance.attendanceDate),
            start: attendance.attendanceDate,
            className: "fc-event-primary",
            groupId: "work",
            details: "Holiday",
          });
        }
        this.calendarEvents = this.calendarEvents.concat({
          id: "event1",
          title: "Present",
          start: attendance.attendanceDate,
          className: "fc-event-success",
          groupId: "work",
          details: "Present",
        });

      });
      const monthDate: Date = new Date(this.data.year, this.data.month - 1, 1);
      for (let i = 1; i <= diffDays; i++) {
        if (presents.indexOf(i) == -1) {
          const absentDate = formatDate(monthDate, settings.SAVE_DATE_FORMAT, 'en');
          if (this.weeklyOffMap.get(this._dateAdapter.getDayOfWeek(monthDate))) {
            this.calendarEvents = this.calendarEvents.concat({
              id: "event1",
              title: "Weekly-OFF",
              start: absentDate,
              className: "fc-event-warning",
              groupId: "work",
              details: "Weekly-OFF",
            });

          } else if (this.upcomingHolidays.get(absentDate)) {
            this.calendarEvents = this.calendarEvents.concat({
              id: "event1",
              title: this.upcomingHolidays.get(absentDate),
              start: absentDate,
              className: "fc-event-primary",
              groupId: "work",
              details: "Holiday",
            });

          } else {
            const absentDate = formatDate(monthDate, settings.SAVE_DATE_FORMAT, 'en');
            this.calendarEvents = this.calendarEvents.concat({
              id: "event1",
              title: "Absent",
              start: absentDate,
              className: "fc-event-danger",
              groupId: "work",
              details: "Absent",
            });
          }
        }
        monthDate.setDate(monthDate.getDate() + 1);
      }

    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
