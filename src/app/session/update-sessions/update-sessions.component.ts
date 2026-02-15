import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../shared/notifications-service';
import { SessionService } from '../../session/session.service';
import { SessionModel } from '../session.model';
import { settings } from '../../demo/data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { Router } from '@angular/router';
import { LocalStorageData } from '../../shared/local-storage-data';

@Component({
  selector: 'app-update-sessions',
  templateUrl: './update-sessions.component.html',
  styleUrls: ['./update-sessions.component.sass']
})
export class UpdateSessionsComponent implements OnInit {

  sessionModels: SessionModel[] = [];
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  sessionForm: FormGroup;
  spinnerButtonOptions: MatProgressButtonOptions;

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private notification: NotificationsService,
    private commonLayout: CommonLayout,
    private router: Router,
    private localStorageData: LocalStorageData,
  ) { }

  ngOnInit() {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();

    this.sessionService.getAllSessionYears().subscribe(data => {
      data.sort((a, b) => a.id > b.id ? -1 : 1);
      this.sessionModels = data;


      this.sessionModels.forEach(sessionModel => {
        if (sessionModel.isActive == 1) {
          this.sessionForm.get('sessionId').setValue(sessionModel.id);
        }
      });
    });

    this.sessionForm = this.fb.group({
      sessionId: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;


    let selectedSession = null;

    this.sessionModels.forEach(sessionModel => {
      if (sessionModel.id == this.sessionForm.get('sessionId').value) {
        selectedSession = sessionModel;
        selectedSession.isActive = 1;
      }
    });

    this.sessionModels.forEach(sessionModel => {
      if (sessionModel.id != selectedSession.id) {
        const selectedDate = new Date(selectedSession.fromDate);
        const maxDate = new Date(sessionModel.fromDate);
        if (selectedDate.getTime() > maxDate.getTime()) {
          sessionModel.isActive = 0;
        } else {
          sessionModel.isActive = 2;
        }
      }

    });

    this.sessionService.updateCurrentSessionYear(this.sessionModels).subscribe(data => {
      data.sort((a, b) => a.id > b.id ? -1 : 1);
      this.sessionModels = data;
      this.spinnerButtonOptions.active = false;
      this.updateSessionYear(selectedSession);
    });
  }

  updateSessionYear(selectedSession) {
    if (selectedSession) {
      this.localStorageData.setSession(selectedSession);
    }
  }

}

