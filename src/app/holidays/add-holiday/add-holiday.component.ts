import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { SessionModel } from '../../session/session.model';
import { LocalStorageData } from '../../shared/local-storage-data';
import { SessionService } from '../../session/session.service';
import { HolidayModel } from '../holiday.model';
import { HolidayService } from '../holiday.service';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';

@Component({
  selector: 'app-add-holiday',
  templateUrl: './add-holiday.component.html',
  styleUrls: ['./add-holiday.component.sass']
})
export class AddHolidayComponent implements OnInit {
  action: string;
  dialogTitle: string = 'Add';
  holidayModel: HolidayModel;

  holidayForm: FormGroup;
  sessionYearList: SessionModel[];
  minDate: Date;
  maxDate: Date;
  spinnerButtonOptions: MatProgressButtonOptions;
  session: SessionModel;

  constructor(private fb: FormBuilder,
    private holidayService: HolidayService,
    private router: Router,
    private sessionService: SessionService,
    private localStorageData: LocalStorageData,
    private commonLayout: CommonLayout,
  ) { }
  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.session = this.localStorageData.sessionValue;

    this.minDate = new Date(this.session.fromDate);
    this.maxDate = new Date(this.session.toDate);

    this.sessionService.getAllCurrentAndUpcomingSessionYears().subscribe(data => {
      this.sessionYearList = data;
    });

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.holidayModel = history.state.holidayModel;
      this.dialogTitle = 'Edit'
    } else {
      this.holidayModel = new HolidayModel({});
      this.holidayModel.sessionYear = this.session.id;
    }
    this.holidayForm = this.fb.group({
      name: [this.holidayModel.name, [Validators.required]],
      holidayDate: [this.holidayModel.holidayDate, Validators.required],
    });
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;

    const holidayModel: HolidayModel = new HolidayModel(this.holidayForm.value);
    holidayModel.sessionYear = this.session.id;
    if (this.action == 'edit') {
      holidayModel.id = this.holidayModel.id;
    }
    this.holidayService.addNewHoliday(holidayModel)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate(['pages/holidays/all-holidays']);
        });
  }
}
