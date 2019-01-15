import { QueryOperation } from '@types';
import { Store, ColumnMetaData, ColumnType, Row, Map } from '@types';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '@StoreService';
import { MessageService } from '@message';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Utils } from '@utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ProjectContractDrawingsTable } from '../tables/ProjectContractDrawingsTable';
import ProjectContractDrawingsType from '../tables/types/ProjectContractDrawingsType';

@Component({
  selector: 'app-contract-drawings',
  templateUrl: './contract-drawings.component.html',
  styleUrls: ['./contract-drawings.component.scss']
})
export class ContractDrawingsComponent implements OnInit, OnDestroy {
  constructor(
    private storeService: StoreService,
    private router: Router,
    private formBuilder: FormBuilder,
    private message: MessageService
  ) {}

  @ViewChild('popupModal')
  popupModal: ModalDirective;

  projectsStore: Store;
  contractDrawingsStore: Store;
  filter: string;
  projectForm: FormGroup;

  ngOnInit() {
    this.projectForm = this.formBuilder.group({
      projectId: new FormControl()
    });
    this.contractDrawingsStore = this.storeService.getInstance(
      'ProjectContractDrawings',
      'ProjectContractDrawings',
      this.getColumns(),
      {
        inserAllowed: true,
        deleteAllowed: true,
        whereClause: 'project_id = ?'
      }
    );
    this.contractDrawingsStore.beforeSave = (dirtyRows: Row[]) => {
      dirtyRows.forEach((row: ProjectContractDrawingsType) => {
        if (row.$operation$ === QueryOperation.INSERT) {
          row.revisionNo = this.contractDrawingsStore.rows.length;
        }
        row.projectId = this.getProjectId();
      });
    };
    this.projectsStore = this.storeService.getInstance(
      'Projects',
      'Projects',
      [],
      {}
    );
    this.projectsStore.query().then(res => {
      this.initProject();
    });
  }

  ngOnDestroy() {
    this.contractDrawingsStore.destroy();
    this.projectsStore.destroy();
  }
  initProject() {
    if (Utils.get('_p')) {
      const projectId = Number(Utils.get('_p'));
      this.setProjectId(projectId);
      this.contractDrawingsStore.whereClauseParams = [projectId];
      this.contractDrawingsStore.query();
    }
  }
  getProjectId() {
    return this.projectForm.controls.projectId.value;
  }
  setProjectId(projectId: number) {
    this.projectForm.controls.projectId.setValue(projectId);
  }
  onProjectChange(open: string) {
    if (!open) {
      const projectId = this.getProjectId();
      if (projectId) {
        Utils.put('_p', projectId);
        this.contractDrawingsStore.whereClauseParams = [projectId];
        this.contractDrawingsStore.query();
      }
    }
  }

  save() {
    if (this.getProjectId()) {
      this.contractDrawingsStore.save();
    } else {
      Utils.notifyError(this.message, 'No project is seletced');
    }
  }

  getColumns = (): ColumnMetaData<ProjectContractDrawingsTable>[] => {
    return [
      {
        column: ProjectContractDrawingsTable.revisionNo,
        title: 'Revision #',
        type: ColumnType.STRING
      },
      {
        column: ProjectContractDrawingsTable.numberOfSheets,
        title: 'No Of Sheets',
        type: ColumnType.NUMBER,
        inserAllowed: true
      },
      {
        column: ProjectContractDrawingsTable.receivedDrawingFolder,
        title: 'Drawings Folder',
        type: ColumnType.STRING,
        inserAllowed: true
      },
      {
        column: ProjectContractDrawingsTable.remarks,
        title: 'Remarks',
        type: ColumnType.STRING,
        onClick: (row, md) => {
          this.popupModal.show();
        }
      }
    ];
  }
}
