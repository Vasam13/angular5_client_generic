import { Store, ColumnMetaData, ColumnType, Row } from '@types';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StoreService } from '@StoreService';
import { MessageService } from '@message';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Utils } from '@utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ProjectRfiDetailsTable } from '../tables/ProjectRfiDetailsTable';
import ProjectRfiDetailsType from '../tables/types/ProjectRfiDetailsType';
@Component({
  selector: 'app-rfi',
  templateUrl: './rfi.component.html',
  styleUrls: ['./rfi.component.scss']
})
export class RfiComponent implements OnInit, OnDestroy {
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
  rfiDetailsStore: Store;
  filter: string;
  projectForm: FormGroup;

  ngOnInit() {
    this.projectForm = this.formBuilder.group({
      projectId: new FormControl()
    });
    this.rfiDetailsStore = this.storeService.getInstance(
      'ProjectRfiDetails',
      'ProjectRfiDetails',
      this.getColumns(),
      {
        inserAllowed: true,
        updateAllowed: true,
        deleteAllowed: true,
        whereClause: 'project_id = ?'
      }
    );
    this.rfiDetailsStore.beforeSave = (dirtyRows: Row[]) => {
      dirtyRows.forEach((row: ProjectRfiDetailsType) => {
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
    this.rfiDetailsStore.destroy();
    this.projectsStore.destroy();
  }
  initProject() {
    if (Utils.get('_p')) {
      const projectId = Number(Utils.get('_p'));
      this.setProjectId(projectId);
      this.rfiDetailsStore.whereClauseParams = [projectId];
      this.rfiDetailsStore.query();
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
        this.rfiDetailsStore.whereClauseParams = [projectId];
        this.rfiDetailsStore.query();
      }
    }
  }

  save() {
    if (this.getProjectId()) {
      this.rfiDetailsStore.save();
    } else {
      Utils.notifyError(this.message, 'No project is seletced');
    }
  }

  getColumns = (): ColumnMetaData<ProjectRfiDetailsTable>[] => {
    return [
      {
        column: ProjectRfiDetailsTable.rfiEmailFolder,
        title: 'Email Folder',
        type: ColumnType.STRING,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectRfiDetailsTable.description,
        title: 'Description',
        type: ColumnType.STRING,
        onClick: (row, md) => {
          this.descModal.show();
        }
      },
      {
        column: ProjectRfiDetailsTable.sentDate,
        title: 'Sent Date',
        type: ColumnType.DATE,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectRfiDetailsTable.remarks,
        title: 'Remarks',
        type: ColumnType.STRING,
        onClick: (row, md) => {
          this.remarksModal.show();
        }
      }
    ];
  }
}
