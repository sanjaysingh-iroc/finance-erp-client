import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { SessionService } from '../../session/session.service';
import { SessionModel } from '../session.model';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../shared/local-storage-data';

@Component({
  selector: 'app-add-session',
  templateUrl: './add-session.component.html',
  styleUrls: ['./add-session.component.css']
})
export class AddSessionComponent implements OnInit {
  action: string;
  dialogTitle: string = 'Add';
  sessionModel: SessionModel;
  sessionForm: FormGroup;
  spinnerButtonOptions: MatProgressButtonOptions;
  sessionMap: Map<number, string> = new Map<number, string>();
  session: SessionModel;

  constructor(private fb: FormBuilder,
    private sessionService: SessionService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,

    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.session = this.localStorageData.sessionValue;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.action = history.state.action;
    if (this.action === 'edit') {
      this.sessionModel = history.state.sessionModel;
      this.dialogTitle = 'Edit'
    } else {
      this.sessionModel = new SessionModel({});
    }

    this.sessionService.getAllSessionYears().subscribe(data => {
      data.forEach(session => {
        this.sessionMap.set(session.id, session.name);

        if (this.action === 'edit') {
          this.sessionMap.delete(this.sessionModel.id);
        }
      });
    });

    this.sessionForm = this.fb.group({
      name: [this.sessionModel.name],
      fromDate: [this.sessionModel.fromDate, [Validators.required]],
      toDate: [this.sessionModel.toDate, [Validators.required]],
      previousSessionId: [this.sessionModel.previousSessionId, [Validators.required]]

    });
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;
    const sessionModel: SessionModel = new SessionModel(this.sessionForm.value);
    sessionModel.isActive = 2;
    if (this.action === 'edit') {
      sessionModel.id = this.sessionModel.id;
      sessionModel.isActive = this.sessionModel.isActive;

    }

    this.sessionService.addNewSession(sessionModel).pipe(first()).subscribe(newSession => {
      this.router.navigate(['billing/session/all-session']);
    });
  }

}
