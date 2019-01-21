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
  employeeRow: Row;
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
    this.employeeForm = this.formBuilder.group({
      details: this.formBuilder.group({
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
        leavingReason: new FormControl()
      })
    });
    if (this.employeeId > -1) {
      this.employeeStore.whereClause =
        'user_id = ? and (deleted = ? or deleted is null)';
      this.employeeStore.whereClauseParams = [this.employeeId, 'N'];
      this.employeeStore.query().then(response => {
        if (response.status === Status.SUCCESS && response.rows.length > 0) {
          this.employeeRow = response.rows[0];
          this.copyRowToForm('details', this.employeeRow);
        } else {
          this.throwError1(this.employeeId);
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
  }

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
  }

  ngOnDestroy() {
    this.employeeStore.destroy();
  }
}
