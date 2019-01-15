import { ModalDirective } from 'ngx-bootstrap/modal';
import { pgUploadComponent } from './../../@pages/components/upload/upload.component';
import {
  UploadFile,
  ZipButtonOptions
} from './../../@pages/components/upload/interface';
import { pgUploadBtnComponent } from './../../@pages/components/upload/upload-btn.component';
import { DataUtils } from './../../@application/data';
import { Utils } from '@utils';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { StoreService } from '@StoreService';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MessageService } from '@message';
import { Row } from '@types';
import { Store, QueryOperation, Status } from '@types';
import { Router, ActivatedRoute } from '@angular/router';
import UsersType from '../tables/types/UsersType';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private storeService: StoreService,
    private formBuilder: FormBuilder,
    private message: MessageService,
    private router: Router
  ) {}

  @ViewChild('ppUpload')
  upload: any;
  @ViewChild('popupModal')
  popup: ModalDirective;
  @ViewChild('reloadPopup')
  reloadPopup: ModalDirective;

  userInfo = Utils.getUserInfo();

  fileList = [
    {
      uid: this.userInfo.userId,
      name: this.userInfo.userId + '.jpg',
      status: 'done',
      url: Utils.getDPUrl()
    }
  ];

  public userForm: FormGroup;
  userStore: Store;

  ngAfterViewInit() {
    if (this.upload) {
      this.upload.onSuccess = (ret: any, file: UploadFile, xhr: any) => {
        if (ret.status === Status.SUCCESS) {
          this.fileList = [];
          this.fileList[0] = {
            uid: 11,
            name: ret.name,
            url: Utils.getDPUrl(),
            status: 'done'
          };
          this.reloadPopup.show();
          // this.popup.show();
          // let url = this.router.url;
          // if (!url.startsWith('#')) {
          //   url = '/#' + url;
          // }
          // window.location.href = url;
        } else {
          Utils.notifyError(this.message, ret.message);
        }
      };
    }
  }

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      userDetails: this.formBuilder.group(this.formFromObject(UsersType))
    });
    this.userStore = this.storeService.getInstance('Users', 'users', []);
    this.userStore.whereClause = 'user_id = ?';
    this.userStore.whereClauseParams = [Utils.getUserId()];
    this.userStore.query().then(res => {
      if (res.status !== Status.SUCCESS || res.rows.length === 0) {
      } else {
        this.copyRowToForm('userDetails', res.rows[0]);
      }
    });
  }

  login() {
    this.router.navigate(['/login']);
  }

  saveChanges() {
    if (this.userForm.valid) {
      const row: UsersType = this.userForm.value.userDetails;
      row.$operation$ = QueryOperation.UPDATE;
      this.userStore.saveRows([this.userForm.value.userDetails]).then(res => {
        const form = this.userForm.controls['userDetails'] as FormGroup;
        form.controls['oldPassword'].setValue(null);
        form.controls['newPassword'].setValue(null);
        if (res.rows && res.rows.length > 0) {
          this.popup.show();
        }
      });
    } else {
      Utils.notifyError(this.message, 'Please fill required fields');
    }
  }

  copyRowToForm(formGroup: string, currentRow: Row) {
    const formRow = this.userForm.value[formGroup];
    Object.keys(currentRow).forEach(key => {
      if (formRow.hasOwnProperty(key)) {
        const form = this.userForm.controls[formGroup] as FormGroup;
        form.controls[key].setValue(currentRow[key]);
      }
    });
  }

  formFromObject(dataClass: object) {
    const clientProfileColumns = DataUtils.getParams(dataClass);
    const formGroup = {};
    // clientProfileColumns.forEach(element => {
    //   formGroup[element] = new FormControl();
    // });
    formGroup['userId'] = new FormControl();
    formGroup['userName'] = new FormControl();
    formGroup['displayName'] = new FormControl();
    formGroup['passwordHash'] = new FormControl();
    formGroup['emailAddress'] = new FormControl();
    formGroup['avatarUrl'] = new FormControl();
    formGroup['avatarBlob'] = new FormControl();
    formGroup['passwordChanged'] = new FormControl();
    formGroup['createDate'] = new FormControl();
    formGroup['createUserId'] = new FormControl();
    formGroup['updateDate'] = new FormControl();
    formGroup['updateUserId'] = new FormControl();
    formGroup['oldPassword'] = new FormControl();
    formGroup['newPassword'] = new FormControl();
    return formGroup;
  }

  isFieldValid(field: string) {
    const form = this.userForm.controls['userDetails'] as FormGroup;
    const control = form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  ngOnDestroy() {
    this.userStore.destroy();
  }
}
