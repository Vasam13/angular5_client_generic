import { DataUtils } from './../data';
import { Row } from '@types';
import { Store, QueryOperation, Status } from '@types';
import { MessageService } from '@message';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StoreService } from '@StoreService';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, NgForm } from '@angular/forms';
import { Utils } from '@utils';
import ClientsType from '../tables/types/ClientsType';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormCanDeactivate } from './../../@core/components/form/form-can-deactivate';

@Component({
  selector: 'app-new-client',
  templateUrl: './new-client.component.html',
  styleUrls: ['./new-client.component.scss']
})
export class NewClientComponent extends FormCanDeactivate
  implements OnInit, OnDestroy {
  constructor(
    private storeService: StoreService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private message: MessageService
  ) {
    super();
    this.route.params.subscribe(params => (this.clientId = params.id));
  }

  @ViewChild('addNewCityModal')
  addNewCityModal: ModalDirective;
  newCityEntered: string;
  citiesStore: Store;

  @ViewChild('form')
  form: NgForm;
  public clientForm: FormGroup;
  clientStore: Store;
  countryStore: Store;
  statesStore: Store;
  public clientId: any;

  gotoClients() {
    this.router.navigate(['/clients']);
  }

  ngOnDestroy() {
    this.clientStore.destroy();
    this.countryStore.destroy();
    this.statesStore.destroy();
    this.citiesStore.destroy();
  }
  ngOnInit() {
    this.clientStore = this.storeService.getInstance('Clients', 'clients', []);
    this.countryStore = this.storeService.getInstance(
      'Countries',
      'countries',
      [],
      {
        autoQuery: true,
        skipOrderBy: true
      }
    );
    this.statesStore = this.storeService.getInstance('States', 'states', [], {
      skipOrderBy: true
    });
    this.citiesStore = this.storeService.getInstance('Cities', 'cities', [], {
      skipOrderBy: true
    });
    this.citiesStore.afterQuery = (rows: Row[]) => {
      if (this.newCityEntered) {
        const form = this.clientForm.controls['clientDetails'] as FormGroup;
        form.controls['city'].setValue(this.newCityEntered);
        // this.newCityEntered = null;
      }
      return rows;
    };
    this.statesStore.whereClause = 'country_id = ?';
    this.citiesStore.whereClause = 'state_id = ?';
    this.clientForm = this.formBuilder.group({
      clientDetails: this.formBuilder.group(this.formFromObject('ClientsType'))
    });
    if (this.clientId !== 'new') {
      this.clientStore.whereClause = 'client_id = ?';
      this.clientStore.whereClauseParams = [this.clientId];
      this.clientStore.query().then(res => {
        if (res.status !== Status.SUCCESS || res.rows.length === 0) {
          Utils.notifyError(
            this.message,
            'No such Client found for Id ' + this.clientId
          );
          this.router.navigate(['/clients']);
        } else {
          this.copyRowToForm('clientDetails', res.rows[0]);
          const clientRow: ClientsType = <ClientsType>res.rows[0];
          this.countryStore.query();
          if (clientRow.country) {
            const country = this.filterCountry(clientRow.country);
            if (country) {
              this.statesStore.whereClauseParams = [country.id];
              this.statesStore.query().then(() => {
                const state = this.filterState(clientRow.state);
                if (state) {
                  this.citiesStore.whereClauseParams = [state.id];
                  this.citiesStore.query();
                }
              });
            }
          }
        }
      });
    }
  }

  filterState(stateName: string) {
    if (this.statesStore && this.statesStore.rows) {
      const selectedStates = this.statesStore.rows.filter(
        _state => _state.name === stateName
      );
      if (selectedStates.length > 0) {
        return selectedStates[0];
      }
    }
  }

  filterCountry(countryName: string) {
    if (this.countryStore && this.countryStore.rows) {
      const selectedCoutries = this.countryStore.rows.filter(
        _country => _country.name === countryName
      );
      if (selectedCoutries.length > 0) {
        return selectedCoutries[0];
      }
    }
  }

  onCountryChange(open: string) {
    if (!open) {
      const country = this.clientForm.value.clientDetails.country;
      if (!country) {
        return;
      }
      if (this.countryStore && this.countryStore.rows) {
        const selectedCoutries = this.countryStore.rows.filter(
          _country => _country.name === country
        );
        if (selectedCoutries.length > 0) {
          const form = this.clientForm.controls['clientDetails'] as FormGroup;
          form.controls['state'].setValue(null);
          this.statesStore.whereClause = 'country_id = ?';
          this.statesStore.whereClauseParams = [selectedCoutries[0].id];
          this.statesStore.query();
        }
      }
    }
  }

  copyRowToForm(formGroup: string, currentRow: Row) {
    const formRow = this.clientForm.value[formGroup];
    Object.keys(currentRow).forEach(key => {
      if (formRow.hasOwnProperty(key)) {
        const form = this.clientForm.controls[formGroup] as FormGroup;
        form.controls[key].setValue(currentRow[key]);
      }
    });
  }

  save() {
    if (this.clientForm.valid) {
      const row: ClientsType = this.clientForm.value.clientDetails;
      row.$operation$ = QueryOperation.INSERT;
      if (row.clientId) {
        row.$operation$ = QueryOperation.UPDATE;
      }
      this.clientStore
        .saveRows([this.clientForm.value.clientDetails])
        .then(res => {
          // Utils.notifySuccess(this.message, 'Error', 'Please fill required fields');
          this.form.form.reset();
          this.router.navigate(['/clients']);
        });
    } else {
      Utils.notifyError(this.message, 'Please fill required fields');
    }
  }

  formFromObject(dataClass: string) {
    const clientProfileColumns = DataUtils.getTypeParams(dataClass);
    const formGroup = {};
    clientProfileColumns.forEach(element => {
      formGroup[element] = new FormControl();
    });
    return formGroup;
  }

  isFieldValid(field: string) {
    const form = this.clientForm.controls['clientDetails'] as FormGroup;
    const control = form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  openNewCityPopup() {
    this.newCityEntered = null;
    const state = this.clientForm.value.clientDetails.state;
    if (!state) {
      return;
    }
    this.addNewCityModal.show();
  }

  addNewCity() {
    if (this.newCityEntered) {
      const state = this.clientForm.value.clientDetails.state;
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

  onStateChange = (open: string) => {
    if (!open) {
      const state = this.clientForm.value.clientDetails.state;
      if (!state) {
        return;
      }
      if (this.statesStore && this.statesStore.rows) {
        const selectedStates = this.statesStore.rows.filter(
          _state => _state.name === state
        );
        if (selectedStates.length > 0) {
          const form = this.clientForm.controls['clientDetails'] as FormGroup;
          form.controls['city'].setValue(null);
          this.citiesStore.whereClause = 'state_id = ?';
          this.citiesStore.whereClauseParams = [selectedStates[0].id];
          this.citiesStore.query();
        }
      }
    }
  }
}
