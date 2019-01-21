import { Utils } from '@utils';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService } from '@StoreService';
import { Store, Status, Row } from '@types';
import { MessageService } from '@message';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  NgForm
} from '@angular/forms';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.scss']
})
export class EmployeeDetailsComponent implements OnInit, OnDestroy {
  employeeId: number;
  employeeStore: Store;
  extraInfoStore: Store;
  employeeRow: Row;
  extraInfoRows: Row[];
  employeeForm: FormGroup;
  maritalStatus = ['Single', 'Married', 'Not Mentioned'];
  yesOrNO = ['Y', 'N'];

  constructor(
    private storeService: StoreService,
    private route: ActivatedRoute,
    private message: MessageService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.route.params.subscribe(params => {
      if (params.id) {
        try {
          this.employeeId = parseInt(params.id, 10);
        } catch (error) {
          this.throwError1(params.id);
        }
      } else {
        this.throwError1(params.id);
      }
    });
  }

  throwError1(userId: any) {
    Utils.notifyError(this.message, 'No/Invalid userId' + userId);
    this.router.navigate(['/settings/manage-employees']);
  }

  ngOnInit() {
    this.employeeStore = this.storeService.getInstance(
      'users',
      'employees',
      []
    );
    this.extraInfoStore = this.storeService.getInstance(
      'usersExtraInfo',
      'usersExtraInfo',
      []
    );
    this.employeeForm = this.formBuilder.group({
      details: this.formBuilder.group(this.getDetailsFormGroup()),
      extraInfo: this.formBuilder.array([])
    });
    if (this.employeeId > -1) {
      this.employeeStore.whereClause =
        'user_id = ? and (deleted = ? or deleted is null)';
      this.employeeStore.whereClauseParams = [this.employeeId, 'N'];
      this.extraInfoStore.whereClause = 'user_id = ?';
      this.extraInfoStore.whereClauseParams = [this.employeeId];

      this.employeeStore.query().then(response => {
        if (response.status === Status.SUCCESS && response.rows.length > 0) {
          this.employeeRow = response.rows[0];
          this.copyRowToForm('details', this.employeeRow);
        } else {
          this.throwError1(this.employeeId);
        }
      });
      this.extraInfoStore.query().then(response => {
        if (response.status === Status.SUCCESS && response.rows.length > 0) {
          this.extraInfoRows = response.rows;
          response.rows.forEach((row: Row, index) => {
            const control = new FormGroup(this.getExtraInfoFormGroup());
            (<FormArray>this.employeeForm.get('extraInfo')).push(control);
          });

          this.copyRowsToForm('extraInfo', this.extraInfoRows);
        } else {
          this.throwError1(this.employeeId);
        }
      });
    }
  }

  copyRowsToForm(formGroup: string, rows: Row[]) {
    const formArray = this.employeeForm.get(formGroup)['controls'] as FormArray;
    for (let i = 0; i < formArray.length; i++) {
      const cntl = formArray[i];
      const row = rows[i];
      Object.keys(row).forEach(key => {
        if (cntl['controls'].hasOwnProperty(key)) {
          cntl['controls'][key].setValue(row[key]);
        }
      });
    }
  }

  copyRowToForm(formGroup: string, currentRow: Row) {
    const formRow = this.employeeForm.value[formGroup];
    Object.keys(currentRow).forEach(key => {
      if (formRow.hasOwnProperty(key)) {
        const form = this.employeeForm.controls[formGroup] as FormGroup;
        form.controls[key].setValue(currentRow[key]);
      }
    });
  }

  isFieldValid(formGroupIndex: number, field: string) {
    let formGroup = null;
    if (formGroupIndex === 0) {
      formGroup = 'details';
    }
    if (!formGroup) {
      return false;
    }
    const form = this.employeeForm.controls[formGroup] as FormGroup;
    const control = form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  save = () => {
    console.log(this.employeeForm.value.details);
    console.log(this.employeeForm.value.extraInfo);
  };

  onNameChange = () => {
    const details = this.employeeForm.value.details;
    // if (this.employeeId === -1) {
    const formGroup = this.employeeForm.controls['details'] as FormGroup;
    let name = '';
    if (details['firstName']) {
      name += details['firstName'];
    }
    if (details['middleName']) {
      name += ' ' + details['middleName'];
    }
    if (details['lastName']) {
      name += ' ' + details['lastName'];
    }
    formGroup.controls['displayName'].setValue(name.trim());
    //  }
  };

  ngOnDestroy() {
    this.employeeStore.destroy();
    this.extraInfoStore.destroy();
  }

  getBorderStyleFix(index: number) {
    const formArray = this.employeeForm.get('extraInfo')[
      'controls'
    ] as FormArray;
    if (index < formArray.length) {
      return 'border-bottom: 0px';
    }
  }

  getExtraInfoFormGroup() {
    return {
      userId: new FormControl(),
      employeeNo: new FormControl(),
      key: new FormControl(),
      value: new FormControl(),
      effectiveFrom: new FormControl(),
      createDate: new FormControl(),
      createUserId: new FormControl(),
      updateDate: new FormControl(),
      updateUserId: new FormControl()
    };
  }
  getDetailsFormGroup() {
    return {
      userId: new FormControl(),
      employeeNo: new FormControl(),
      firstName: new FormControl(),
      middleName: new FormControl(),
      lastName: new FormControl(),
      displayName: new FormControl(),
      fatherName: new FormControl(),
      gender: new FormControl(),
      dateOfBirth: new FormControl(),
      maritalStatus: new FormControl(),
      emailAddress: new FormControl(),
      mobile: new FormControl(),
      title: new FormControl(),
      dateOfJoin: new FormControl(),
      managerNo: new FormControl(),
      managerName: new FormControl(),
      leftOrg: new FormControl(),
      resignSubmitDate: new FormControl(),
      relieveDate: new FormControl(),
      leavingDate: new FormControl(),
      noticePeriod: new FormControl(),
      isNoticeRequired: new FormControl(),
      cofirmDate: new FormControl(),
      status: new FormControl(),
      leavingReason: new FormControl(),
      createDate: new FormControl(),
      createUserId: new FormControl(),
      updateDate: new FormControl(),
      updateUserId: new FormControl()
    };
  }
}
