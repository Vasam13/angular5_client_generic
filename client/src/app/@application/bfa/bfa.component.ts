import { Store, ColumnMetaData, ColumnType, Row } from '@types';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StoreService } from '@StoreService';
import { MessageService } from '@message';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Utils } from '@utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ProjectBfaDetailsTable } from '../tables/ProjectBfaDetailsTable';
import ProjectBfaDetailsType from '../tables/types/ProjectBfaDetailsType';

@Component({
  selector: 'app-bfa',
  templateUrl: './bfa.component.html',
  styleUrls: ['./bfa.component.scss']
})
export class BfaComponent implements OnInit, OnDestroy {
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
  bfaDetailsStore: Store;
  filter: string;
  projectForm: FormGroup;

  ngOnInit() {
    this.projectForm = this.formBuilder.group({
      projectId: new FormControl()
    });
    this.bfaDetailsStore = this.storeService.getInstance(
      'ProjectBfaDetails',
      'ProjectBfaDetails',
      this.getColumns(),
      {
        inserAllowed: true,
        updateAllowed: true,
        deleteAllowed: true,
        whereClause: 'project_id = ?'
      }
    );
    this.bfaDetailsStore.beforeSave = (dirtyRows: Row[]) => {
      dirtyRows.forEach((row: ProjectBfaDetailsType) => {
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
    this.bfaDetailsStore.destroy();
    this.projectsStore.destroy();
  }
  initProject() {
    if (Utils.get('_p')) {
      const projectId = Number(Utils.get('_p'));
      this.setProjectId(projectId);
      this.bfaDetailsStore.whereClauseParams = [projectId];
      this.bfaDetailsStore.query();
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
        this.bfaDetailsStore.whereClauseParams = [projectId];
        this.bfaDetailsStore.query();
      }
    }
  }

  save() {
    if (this.getProjectId()) {
      this.bfaDetailsStore.save();
    } else {
      Utils.notifyError(this.message, 'No project is seletced');
    }
  }

  getColumns = (): ColumnMetaData<ProjectBfaDetailsTable>[] => {
    return [
      {
        column: ProjectBfaDetailsTable.subNumber,
        title: 'SUB Number',
        type: ColumnType.STRING,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectBfaDetailsTable.description,
        title: 'Description',
        type: ColumnType.STRING,
        onClick: (row, md) => {
          this.descModal.show();
        }
      },
      {
        column: ProjectBfaDetailsTable.receivedDate,
        title: 'Received Date',
        type: ColumnType.DATE,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectBfaDetailsTable.releaseDate,
        title: 'Release Date',
        type: ColumnType.DATE,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectBfaDetailsTable.bfaStatus,
        title: 'BFA Status',
        type: ColumnType.STRING,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectBfaDetailsTable.linkWithServer,
        title: 'Server Link',
        type: ColumnType.STRING,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectBfaDetailsTable.status,
        title: 'Status',
        type: ColumnType.STRING,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectBfaDetailsTable.remarks,
        title: 'Remarks',
        type: ColumnType.STRING,
        onClick: (row, md) => {
          this.remarksModal.show();
        }
      }
    ];
  }
}
