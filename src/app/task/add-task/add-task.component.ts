import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { TaskService } from '../../task/task.service';
import { settings } from '../../demo/data';
import { TaskModel } from '../task.model';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LoginModel } from '../../auth/login-model';
import { LocalStorageData } from '../../shared/local-storage-data';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {
  action: string;
  dialogTitle: string = 'Add';
  taskModel: TaskModel;
  taskForm: FormGroup;
  minDate: Date;
  spinnerButtonOptions: MatProgressButtonOptions;
  login: LoginModel;
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();

  constructor(private fb: FormBuilder,
    private taskService: TaskService,
    private staffService: StaffService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.minDate = new Date();
    this.action = history.state.action;

    this.staffService.getAllUsers(this.login.companyId).subscribe(data => {
      data.forEach(staffModel => this.staffMap.set(staffModel.id, staffModel));
    });

    if (this.action === 'edit') {
      this.taskModel = history.state.taskModel;
      this.dialogTitle = 'Edit'
    } else {
      this.taskModel = new TaskModel({});
      this.taskModel.createDate = formatDate(new Date, settings.SAVE_DATE_FORMAT, 'en');
    }

    this.taskForm = this.fb.group({
      staffId: [this.taskModel.staffId, [Validators.required]],
      message: [this.taskModel.message, [Validators.required]],
      createDate: [this.taskModel.createDate, [Validators.required]],
    });
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;
    const taskModel: TaskModel = new TaskModel(this.taskForm.value);
    taskModel.companyId = this.login.companyId;

    if (this.action === 'edit') {
      taskModel.id = this.taskModel.id;
    }

    this.taskService.addNewTask(taskModel).pipe(first()).subscribe(data => {
      this.router.navigate(['finance/task/all-task']);
    });
  }



  getSMSText(smsTemplate: string, params: string[]) {
    let index = 1;
    params.forEach(param => {
      smsTemplate = smsTemplate.replace("{{" + index + "}}", param);
    })
    return smsTemplate;
  }

}
