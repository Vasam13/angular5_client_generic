import { Row, QueryOperation, ProjectStatus } from '@types';
import { MessageService } from '@message';
import { Utils } from '@utils';
import { Store, Status } from '@types';
import { StoreService } from '@StoreService';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { DataUtils } from '../data';
import { ModalDirective } from 'ngx-bootstrap/modal';
import ProjectsType from '../tables/types/ProjectsType';
@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storeService: StoreService,
    private message: MessageService,
    private formBuilder: FormBuilder
  ) {
    this.route.params.subscribe(params => (this.projectId = params.id));
  }

  projectForm: FormGroup;
  public projectId: any;
  clientStore: Store;
  projectsStore: Store;
  complexity = ['Normal', 'Medium', 'High', 'Critical'];

  gotoProjects() {
    this.router.navigate(['/projects']);
  }
  save() {
    if (this.isFormValid()) {
      const projectRow: ProjectsType = this.projectForm.value.projectDetails;
      projectRow.status = ProjectStatus.OPEN;
      projectRow.$operation$ = QueryOperation.INSERT;
      this.projectsStore.saveRows([<Row>projectRow]).then(_res => {
        if (_res.rows && _res.rows.length > 0) {
          Utils.notifyInfo(this.message, 'Project saved!');
          this.gotoProjects();
        }
      });
    }
  }

  ngOnInit() {
    this.projectForm = this.formBuilder.group({
      projectDetails: this.formBuilder.group(
        this.formFromObject('ProjectsType')
      )
    });
    this.clientStore = this.storeService.getInstance('Users', 'users', []);
    this.projectsStore = this.storeService.getInstance(
      'Projects',
      'projects',
      []
    );
    this.clientStore.whereClause =
      'user_id in (select user_id from user_roles where role_id =' +
      '(select role_id from roles where role_code = ?))';
    this.clientStore.whereClauseParams = ['teamlead'];
    this.clientStore.query();
    if (this.projectId !== 'new') {
      this.projectsStore.whereClause = 'project_id = ?';
      this.projectsStore.whereClauseParams = [this.projectId];
      this.projectsStore.query().then(res => {
        if (res.status !== Status.SUCCESS || res.rows.length === 0) {
          Utils.notifyError(
            this.message,
            'No such Project found for Id ' + this.projectId
          );
          this.router.navigate(['/projects']);
        } else {
          this.copyRowToForm('projectDetails', res.rows[0]);
        }
      });
    }
  }

  copyRowToForm(formGroup: string, currentRow: Row) {
    const formRow = this.projectForm.value[formGroup];
    Object.keys(currentRow).forEach(key => {
      if (formRow.hasOwnProperty(key)) {
        const form = this.projectForm.controls[formGroup] as FormGroup;
        form.controls[key].setValue(currentRow[key]);
      }
    });
  }

  ngOnDestroy() {
    this.clientStore.destroy();
    this.projectsStore.destroy();
  }

  formFromObject(dataClass: string) {
    const columns = DataUtils.getTypeParams(dataClass);
    const formGroup = {};
    columns.forEach(element => {
      formGroup[element] = new FormControl();
    });
    return formGroup;
  }

  isFieldValid(field: string) {
    const form = this.projectForm.controls['projectDetails'] as FormGroup;
    const control = form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  isFormValid() {
    if (this.projectForm.valid) {
      return true;
    } else {
      Utils.notifyError(this.message, 'Please fill required fields');
      return false;
    }
  }
}
