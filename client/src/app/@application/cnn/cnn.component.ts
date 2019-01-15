import { Store, ColumnMetaData, ColumnType, Row } from '@types';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StoreService } from '@StoreService';
import { MessageService } from '@message';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Utils } from '@utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ProjectCnnDetailsTable } from '../tables/ProjectCnnDetailsTable';
import ProjectCnnDetailsType from '../tables/types/ProjectCnnDetailsType';

@Component({
  selector: 'app-cnn',
  templateUrl: './cnn.component.html',
  styleUrls: ['./cnn.component.scss']
})
export class CnnComponent implements OnInit, OnDestroy {
  constructor(
    private storeService: StoreService,
    private formBuilder: FormBuilder,
    private message: MessageService
  ) {}

  @ViewChild('remarksModal')
  remarksModal: ModalDirective;

  @ViewChild('descModal')
  descModal: ModalDirective;

  projectsStore: Store;
  cnnDetailsStore: Store;
  filter: string;
  projectForm: FormGroup;

  ngOnInit() {
    this.projectForm = this.formBuilder.group({
      projectId: new FormControl()
    });
    this.cnnDetailsStore = this.storeService.getInstance(
      'ProjectCnnDetails',
      'ProjectCnnDetails',
      this.getColumns(),
      {
        inserAllowed: true,
        updateAllowed: true,
        deleteAllowed: true,
        whereClause: 'project_id = ?'
      }
    );
    this.cnnDetailsStore.beforeSave = (dirtyRows: Row[]) => {
      dirtyRows.forEach((row: ProjectCnnDetailsType) => {
        row.projectId = this.getProjectId();
      });
    };
    this.projectsStore = this.storeService.getInstance(
      'Projects',
      'Projects',
      []
    );
    this.projectsStore.query().then(res => {
      this.initProject();
    });
  }

  ngOnDestroy() {
    this.cnnDetailsStore.destroy();
    this.projectsStore.destroy();
  }
  initProject() {
    if (Utils.get('_p')) {
      const projectId = Number(Utils.get('_p'));
      this.setProjectId(projectId);
      this.cnnDetailsStore.whereClauseParams = [projectId];
      this.cnnDetailsStore.query();
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
        this.cnnDetailsStore.whereClauseParams = [projectId];
        this.cnnDetailsStore.query();
      }
    }
  }

  save() {
    if (this.getProjectId()) {
      this.cnnDetailsStore.save();
    } else {
      Utils.notifyError(this.message, 'No project is seletced');
    }
  }

  getColumns = (): ColumnMetaData<ProjectCnnDetailsTable>[] => {
    return [
      {
        column: ProjectCnnDetailsTable.cnnHours,
        title: 'CNN Hours',
        type: ColumnType.NUMBER,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectCnnDetailsTable.description,
        title: 'Description',
        type: ColumnType.STRING,
        onClick: (row, md) => {
          this.descModal.show();
        }
      },
      {
        column: ProjectCnnDetailsTable.sentDate,
        title: 'Sent Date',
        type: ColumnType.DATE,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectCnnDetailsTable.receivedDate,
        title: 'Received Date',
        type: ColumnType.DATE,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectCnnDetailsTable.status,
        title: 'Status',
        type: ColumnType.STRING,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectCnnDetailsTable.remarks,
        title: 'Remarks',
        type: ColumnType.STRING,
        onClick: (row, md) => {
          this.remarksModal.show();
        }
      }
    ];
  }
}
