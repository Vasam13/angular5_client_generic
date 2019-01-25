import { Utils } from '@utils';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StoreService } from '@StoreService';
import { Store, Status, Row, QueryOperation } from '@types';
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
  managerStore: Store;
  extraInfoStore: Store;
  employeeRow: Row;
  extraInfoRows: Row[];
  employeeForm: FormGroup;
  maritalStatus = ['Single', 'Married', 'Not Mentioned'];
  yesOrNO = ['Y', 'N'];
  countryStore1: Store;
  statesStore1: Store;
  countryStore2: Store;
  statesStore2: Store;
  countryStore3: Store;
  statesStore3: Store;

  /* ShiftName	ShiftCode
    Weekly Off	WO
    Fixed Shift	FS
    NoShift	NS
    Holiday	H
    General	GS
    Evening Shift	Evening Shift
    Morning Shift	Morning Shift*/

  @ViewChild('form')
  form: NgForm;

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
    this.managerStore = this.storeService.getInstance('users', 'managers', [], {
      selectParams: ['userId', 'employeeNo', 'displayName']
    });
    this.managerStore.query();

    this.extraInfoStore = this.storeService.getInstance(
      'usersExtraInfo',
      'usersExtraInfo',
      []
    );
    this.employeeForm = this.formBuilder.group({
      details: this.formBuilder.group(this.getDetailsFormGroup()),
      extraInfo: this.formBuilder.array([])
    });
    this.initCountryStateStores();
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
          this.queryStateStores();
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

  gotoHome() {
    this.router.navigate(['/settings/manage-employees']);
  }

  save() {
    if (!this.isFormValid()) {
      return;
    }
    const userRow: Row = this.employeeForm.value.details;
    if (this.employeeId > -1) {
      userRow.$operation$ = QueryOperation.UPDATE;
    } else {
      userRow.$operation$ = QueryOperation.INSERT;
    }

    this.employeeStore.saveRows([<Row>userRow]).then(_res => {
      // Utils.notifyInfo(this.message, 'Success', 'Lead saved!');
      if (_res.status === Status.SUCCESS) {
        this.resetAllForms();
        this.gotoHome();
      }
    });
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

  onNameChange() {
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
    this.extraInfoStore.destroy();
    this.countryStore1.destroy();
    this.statesStore1.destroy();
    this.countryStore2.destroy();
    this.statesStore2.destroy();
    this.countryStore3.destroy();
    this.statesStore3.destroy();
    this.managerStore.destroy();
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
      leftOrg: new FormControl(),
      resignSubmitDate: new FormControl(),
      relieveDate: new FormControl(),
      leavingDate: new FormControl(),
      noticePeriod: new FormControl(),
      isNoticeRequired: new FormControl(),
      confirmDate: new FormControl(),
      status: new FormControl(),
      leavingReason: new FormControl(),

      contactAddressName: new FormControl(),
      contactAddressEmail: new FormControl(),
      contactAddressAddress1: new FormControl(),
      contactAddressAddress2: new FormControl(),
      contactAddressAddress3: new FormControl(),
      contactAddressCity: new FormControl(),
      contactAddressState: new FormControl(),
      contactAddressCountry: new FormControl(),
      contactAddressPin: new FormControl(),
      contactAddressPhone1: new FormControl(),
      contactAddressPhone2: new FormControl(),
      contactAddressMobile: new FormControl(),

      presentAddressName: new FormControl(),
      presentAddressEmail: new FormControl(),
      presentAddressAddress1: new FormControl(),
      presentAddressAddress2: new FormControl(),
      presentAddressAddress3: new FormControl(),
      presentAddressCity: new FormControl(),
      presentAddressState: new FormControl(),
      presentAddressCountry: new FormControl(),
      presentAddressPin: new FormControl(),
      presentAddressPhone1: new FormControl(),
      presentAddressPhone2: new FormControl(),
      presentAddressMobile: new FormControl(),

      permanentAddressName: new FormControl(),
      permanentAddressEmail: new FormControl(),
      permanentAddressAddress1: new FormControl(),
      permanentAddressAddress2: new FormControl(),
      permanentAddressAddress3: new FormControl(),
      permanentAddressCity: new FormControl(),
      permanentAddressState: new FormControl(),
      permanentAddressCountry: new FormControl(),
      permanentAddressPin: new FormControl(),
      permanentAddressPhone1: new FormControl(),
      permanentAddressPhone2: new FormControl(),
      permanentAddressMobile: new FormControl(),

      createDate: new FormControl(),
      createUserId: new FormControl(),
      updateDate: new FormControl(),
      updateUserId: new FormControl()
    };
  }

  filterCountry(countryStore: Store, countryName: string) {
    if (countryStore && countryStore.rows) {
      const selectedCoutries = countryStore.rows.filter(
        _country => _country.name === countryName
      );
      if (selectedCoutries.length > 0) {
        return selectedCoutries[0];
      }
    }
  }

  onManagerSelect(open: string) {
    console.log(open);
    if (!open) {
    }
  }

  isFormValid() {
    if (this.employeeForm.valid) {
      return true;
    } else {
      Utils.notifyError(this.message, 'Please fill required fields');
      return false;
    }
  }

  resetAllForms() {
    this.form.form.reset();
  }

  queryStateStores() {
    if (this.employeeRow.contactAddressCountry) {
      const country = this.filterCountry(
        this.countryStore1,
        this.employeeRow.contactAddressCountry
      );
      if (country) {
        this.statesStore1.whereClauseParams = [country.id];
        this.statesStore1.query();
      }
    }
    if (this.employeeRow.presentAddressCountry) {
      const country = this.filterCountry(
        this.countryStore2,
        this.employeeRow.presentAddressCountry
      );
      if (country) {
        this.statesStore2.whereClauseParams = [country.id];
        this.statesStore2.query();
      }
    }
    if (this.employeeRow.permanentAddressCountry) {
      const country = this.filterCountry(
        this.countryStore3,
        this.employeeRow.permanentAddressCountry
      );
      if (country) {
        this.statesStore3.whereClauseParams = [country.id];
        this.statesStore3.query();
      }
    }
  }

  initCountryStateStores() {
    this.countryStore1 = this.storeService.getInstance(
      'Countries',
      'countries',
      [],
      { skipOrderBy: true }
    );
    this.countryStore1.query();
    this.statesStore1 = this.storeService.getInstance('States', 'states', [], {
      skipOrderBy: true
    });
    this.statesStore1.whereClause = 'country_id = ?';

    this.countryStore2 = this.storeService.getInstance(
      'Countries',
      'countries',
      [],
      { skipOrderBy: true }
    );
    this.countryStore2.query();
    this.statesStore2 = this.storeService.getInstance('States', 'states', [], {
      skipOrderBy: true
    });
    this.statesStore2.whereClause = 'country_id = ?';

    this.countryStore3 = this.storeService.getInstance(
      'Countries',
      'countries',
      [],
      { skipOrderBy: true }
    );
    this.countryStore3.query();
    this.statesStore3 = this.storeService.getInstance('States', 'states', [], {
      skipOrderBy: true
    });
    this.statesStore3.whereClause = 'country_id = ?';
  }

  onCountryChange1(open: string) {
    if (!open) {
      const country = this.employeeForm.value.details.contactAddressCountry;
      if (!country) {
        return;
      }
      if (this.countryStore1 && this.countryStore1.rows) {
        const selectedCoutries = this.countryStore1.rows.filter(
          _country => _country.name === country
        );
        if (selectedCoutries.length > 0) {
          const form = this.employeeForm.controls['details'] as FormGroup;
          form.controls['contactAddressState'].setValue(null);
          this.statesStore1.whereClause = 'country_id = ?';
          this.statesStore1.whereClauseParams = [selectedCoutries[0].id];
          this.statesStore1.query();
        }
      }
    }
  }
  onCountryChange2(open: string) {
    if (!open) {
      const country = this.employeeForm.value.details.presentAddressCountry;
      if (!country) {
        return;
      }
      if (this.countryStore1 && this.countryStore1.rows) {
        const selectedCoutries = this.countryStore1.rows.filter(
          _country => _country.name === country
        );
        if (selectedCoutries.length > 0) {
          const form = this.employeeForm.controls['details'] as FormGroup;
          form.controls['presentAddressState'].setValue(null);
          this.statesStore2.whereClause = 'country_id = ?';
          this.statesStore2.whereClauseParams = [selectedCoutries[0].id];
          this.statesStore2.query();
        }
      }
    }
  }
  onCountryChange3(open: string) {
    if (!open) {
      const country = this.employeeForm.value.details.permanentAddressCountry;
      if (!country) {
        return;
      }
      if (this.countryStore1 && this.countryStore1.rows) {
        const selectedCoutries = this.countryStore1.rows.filter(
          _country => _country.name === country
        );
        if (selectedCoutries.length > 0) {
          const form = this.employeeForm.controls['details'] as FormGroup;
          form.controls['permanentAddressState'].setValue(null);
          this.statesStore3.whereClause = 'country_id = ?';
          this.statesStore3.whereClauseParams = [selectedCoutries[0].id];
          this.statesStore3.query();
        }
      }
    }
  }
}
