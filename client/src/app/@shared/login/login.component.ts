import { Subscription } from 'rxjs/Subscription';
import { APIManager } from '@types';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {Utils} from '@utils';
import { APIService } from '@APIService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isBusy = false;
  api: APIManager;
  loginSubscription: Subscription;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private apiService: APIService
  ) {
    this.api = apiService.getInstance();
  }

  ngOnInit() {
    Utils.deleteCookie();
    this.loginForm = this.formBuilder.group({
      loginInfo: this.formBuilder.group({
        userName: new FormControl(),
        password: new FormControl()
      })
    });
  }

  ngOnDestroy() {
    this.api.destroy();
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  isFieldValid(field: string) {
    const form = this.loginForm.controls['loginInfo'] as FormGroup;
    const control = form.controls[field];
    return !(control.invalid && (control.dirty || control.touched));
  }

  login = () => {
    if (this.loginForm.valid) {
      this.isBusy = true;
      const data = this.loginForm.value.loginInfo;
      this.loginSubscription = this.api
        .login(data.userName, data.password)
        .subscribe((res: boolean) => {
          this.isBusy = false;
          if (res) {
            this.router.navigate(['/']);
          }
        });
    }
  }
}
