import { Status, Roles } from '@types';
import { Row, LeadStatus, DMLResponse } from '@types';
import { Store, QueryOperation } from '@types';
import { MessageService } from '@message';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StoreService } from '@StoreService';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, NgForm } from '@angular/forms';
import { Utils } from '@utils';
import ClientsType from './../tables/types/ClientsType';
import SalesType from './../tables/types/SalesType';
import { DataUtils } from '../data';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormCanDeactivate } from './../../@core/components/form/form-can-deactivate';

@Component({
  selector: 'app-new-sale',
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.scss']
})
export class NewSaleComponent extends FormCanDeactivate
  implements OnInit, OnDestroy {
  constructor(
    private storeService: StoreService,
    private router: Router,
    private formBuilder: FormBuilder,
    private message: MessageService
  ) {
    super();
  }

  @ViewChild('form')
  form: NgForm;

  @ViewChild('addNewCityModal')
  addNewCityModal: ModalDirective;
  @ViewChild('newBidDetailPopup')
  newBidDetailPopup: ModalDirective;
  newCityEntered: string;
  newRequirement: string;

  public salesForm: FormGroup;
  salesStore: Store;
  clientStore: Store;
  salesPersonStore: Store;
  estimationLeadsStore: Store;
  countryStore: Store;
  statesStore: Store;
  citiesStore: Store;

  requirements = ['Structural', 'Engineering', 'Miscellaneous'];

  isPageBusy() {
    return (
      this.salesStore.isBusy ||
      this.clientStore.isBusy ||
      this.salesPersonStore.isBusy ||
      this.estimationLeadsStore.isBusy ||
      this.countryStore.isBusy ||
      this.statesStore.isBusy ||
      this.statesStore.isBusy
    );
  }

  gotoSales() {
    this.router.navigate(['/sales']);
  }
  isSalesManager() {
    return Utils.hasAnyRole([Roles.SALES_MANAGER]);
  }
  isSalesPerson() {
    return Utils.hasAnyRole([Roles.SALES_PERSON]);
  }
  save(action) {
    if (this.salesForm.valid) {
      const salesRow: SalesType = this.salesForm.value.projectDetails;
      const clientDetails: ClientsType = <ClientsType>(
        this.salesForm.value.clientDetails
      );
      salesRow.clientId = clientDetails.clientId;
      salesRow.$operation$ = QueryOperation.INSERT;
      salesRow.status = LeadStatus.DRAFT;
      if (action === 'publish') {
        salesRow.status = LeadStatus.OPEN;
      }
      if (action === 'sendForEstimate') {
        salesRow.status = LeadStatus.REQUEST_FOR_ESTIMATION;
      }
      if (this.isSalesPerson()) {
        salesRow.executive = Utils.getUserId();
      }
      salesRow.bidType = this.arrayToString(salesRow.bidType);
      this.salesStore.saveRows(<Row[]>[salesRow]).then((res: DMLResponse) => {
        if (res.rows && res.rows.length > 0) {
          this.form.form.reset();
          this.gotoSales();
        }
      });
    } else {
      Utils.notifyError(this.message, 'Please fill required fields');
    }
  }
  onClientChange(open) {
    if (!open) {
      const row: ClientsType = <ClientsType>this.salesForm.value.clientDetails;
      if (row.clientId) {
        this.clientStore.rows.forEach((client: ClientsType) => {
          if (client.clientId === row.clientId) {
            this.copyClientRowToForm(client);
          }
        });
      }
    }
  }
  copyClientRowToForm(currentRow: ClientsType) {
    const formRow = this.salesForm.value.clientDetails;
    Object.keys(currentRow).forEach(key => {
      if (formRow.hasOwnProperty(key)) {
        const form = this.salesForm.controls['clientDetails'] as FormGroup;
        form.controls[key].setValue(currentRow[key]);
      }
    });
  }
  ngOnDestroy() {
    this.clientStore.destroy();
    this.salesStore.destroy();
    this.countryStore.destroy();
    this.statesStore.destroy();
    this.citiesStore.destroy();
    this.salesPersonStore.destroy();
    this.estimationLeadsStore.destroy();
  }
  ngOnInit() {
    this.clientStore = this.storeService.getInstance('Clients', 'clients', [], {
      autoQuery: true
    });
    this.countryStore = this.storeService.getInstance(
      'Countries',
      'countries',
      [],
      { skipOrderBy: true }
    );
    this.countryStore.query();
    this.statesStore = this.storeService.getInstance('States', 'states', [], {
      skipOrderBy: true
    });
    this.citiesStore = this.storeService.getInstance('Cities', 'cities', [], {
      skipOrderBy: true
    });
    this.citiesStore.afterQuery = (rows: Row[]) => {
      if (this.newCityEntered) {
        const form = this.salesForm.controls['projectDetails'] as FormGroup;
        form.controls['projectCity'].setValue(this.newCityEntered);
        // this.newCityEntered = null;
      }
      return rows;
    };
    this.salesStore = this.storeService.getInstance('Sales', 'sales', []);

    this.salesPersonStore = this.storeService.getInstance('Users', 'users', []);
    this.salesPersonStore.whereClause =
      'user_id in (select user_id from user_roles where role_id =' +
      '(select role_id from roles where role_code = ?))';
    this.salesPersonStore.whereClauseParams = ['salesperson'];
    if (this.isSalesManager()) {
      this.salesPersonStore.query();
    }
    this.estimationLeadsStore = this.storeService.getInstance(
      'Users',
      'users',
      []
    );
    this.estimationLeadsStore.whereClause =
      'user_id in (select user_id from user_roles where role_id =' +
      '(select role_id from roles where role_code = ?))';
    this.estimationLeadsStore.whereClauseParams = ['estimationmanager'];
    this.estimationLeadsStore.query();

    this.salesForm = this.formBuilder.group({
      clientDetails: this.formBuilder.group(this.formFromObject('ClientsType')),
      projectDetails: this.formBuilder.group(this.formFromObject('SalesType'))
    });
  }

  formFromObject(dataClass: string) {
    const clientProfileColumns = DataUtils.getTypeParams(dataClass);
    const formGroup = {};
    clientProfileColumns.forEach(element => {
      formGroup[element] = new FormControl();
    });
    return formGroup;
  }

  arrayToString(str: any) {
    let _str = '';
    if (str instanceof Array) {
      str.forEach(ms => {
        _str += ms + '$';
      });
    }
    if (_str.endsWith('$')) {
      _str = _str.substr(0, _str.length - 1);
    }
    return _str;
  }

  isFieldValid(formGroupIndex: number, field: string) {
    let formGroup = null;
    if (formGroupIndex === 0) {
      formGroup = 'clientDetails';
    } else if (formGroupIndex === 1) {
      formGroup = 'projectDetails';
    }
    if (!formGroup) {
      return false;
    }
    const form = this.salesForm.controls[formGroup] as FormGroup;
    const control = form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  openNewCityPopup() {
    this.newCityEntered = null;
    const state = this.salesForm.value.projectDetails.projectState;
    if (!state) {
      return;
    }
    this.addNewCityModal.show();
  }

  addNewCity() {
    if (this.newCityEntered) {
      const state = this.salesForm.value.projectDetails.projectState;
      if (!state) {
        return;
      }
      const selectedStates = this.statesStore.rows.filter(
        _state => _state.name === state
      );
      if (selectedStates.length > 0) {
        const newCity: Row = {
          name: this.newCityEntered,
          state_id: selectedStates[0].id,
          $operation$: QueryOperation.INSERT
        };
        this.citiesStore.saveRows([newCity]).then(res => {
          this.addNewCityModal.hide();
          this.newCityEntered = null;
        });
      }
    }
  }

  addNewRequirement() {
    if (
      this.newRequirement &&
      this.newRequirement.trim().length > 0 &&
      this.requirements.indexOf(this.newRequirement) === -1
    ) {
      const arr = this.salesForm.value.projectDetails.bidType;
      arr.push(this.newRequirement);
      this.requirements.push(this.newRequirement);
      const form = this.salesForm.controls['projectDetails'] as FormGroup;
      form.controls['bidType'].setValue(arr);
    }
    this.newBidDetailPopup.hide();
  }

  onStateChange = (open: string) => {
    if (!open) {
      const state = this.salesForm.value.projectDetails.projectState;
      if (!state) {
        return;
      }
      if (this.statesStore && this.statesStore.rows) {
        const selectedStates = this.statesStore.rows.filter(
          _state => _state.name === state
        );
        if (selectedStates.length > 0) {
          const form = this.salesForm.controls['projectDetails'] as FormGroup;
          form.controls['projectCity'].setValue(null);
          this.citiesStore.whereClause = 'state_id = ?';
          this.citiesStore.whereClauseParams = [selectedStates[0].id];
          this.citiesStore.query();
        }
      }
    }
  };

  readOnlyBidDetails() {
    return !(this.isSalesManager() || this.isSalesPerson());
  }

  onCountryChange = (open: string) => {
    if (!open) {
      const country = this.salesForm.value.projectDetails.projectCountry;
      if (!country) {
        return;
      }
      if (this.countryStore && this.countryStore.rows) {
        const selectedCoutries = this.countryStore.rows.filter(
          _country => _country.name === country
        );
        if (selectedCoutries.length > 0) {
          const form = this.salesForm.controls['projectDetails'] as FormGroup;
          form.controls['projectState'].setValue(null);
          this.statesStore.whereClause = 'country_id = ?';
          this.statesStore.whereClauseParams = [selectedCoutries[0].id];
          this.statesStore.query();
        }
      }
    }
  };
}
