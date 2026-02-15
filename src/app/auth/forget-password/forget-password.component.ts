import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {

  forgetPassword: FormGroup;
  isDisable: boolean;
  constructor(private formBuilder: FormBuilder) {
    this.forgetPassword = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]

    });
    this.isDisable= true;
  }

  ngOnInit(): void {
  }

  get f(): any {
    return this.forgetPassword.controls;
  }
  onSubmit() {
  }

}
