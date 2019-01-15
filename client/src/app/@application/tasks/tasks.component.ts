import { Store, ColumnMetaData, ColumnType, Row } from '@types';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StoreService } from '@StoreService';
import { MessageService } from '@message';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Utils } from '@utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ProjectTaskDetailsTable } from '../tables/ProjectTaskDetailsTable';
import ProjectTaskDetailsType from '../tables/types/ProjectTaskDetailsType';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit, OnDestroy {
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
  taskDetailsStore: Store;
  filter: string;
  projectForm: FormGroup;

  ngOnInit() {
    this.projectForm = this.formBuilder.group({
      projectId: new FormControl()
    });
    this.taskDetailsStore = this.storeService.getInstance(
      'ProjectTaskDetails',
      'ProjectTaskDetails',
      this.getColumns(),
      {
        inserAllowed: true,
        updateAllowed: true,
        deleteAllowed: true,
        whereClause: 'project_id = ?'
      }
    );
    this.taskDetailsStore.beforeSave = (dirtyRows: Row[]) => {
      dirtyRows.forEach((row: ProjectTaskDetailsType) => {
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
    this.taskDetailsStore.destroy();
    this.projectsStore.destroy();
  }
  initProject() {
    if (Utils.get('_p')) {
      const projectId = Number(Utils.get('_p'));
      this.setProjectId(projectId);
      this.taskDetailsStore.whereClauseParams = [projectId];
      this.taskDetailsStore.query();
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
        this.taskDetailsStore.whereClauseParams = [projectId];
        this.taskDetailsStore.query();
      }
    }
  }

  save() {
    if (this.getProjectId()) {
      this.taskDetailsStore.save();
    } else {
      Utils.notifyError(this.message, 'No project is seletced');
    }
  }

  getColumns = (): ColumnMetaData<ProjectTaskDetailsTable>[] => {
    return [
      {
        column: ProjectTaskDetailsTable.taskName,
        title: 'Task Name',
        type: ColumnType.STRING,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectTaskDetailsTable.type,
        title: 'Task Type',
        type: ColumnType.STRING,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectTaskDetailsTable.assignedTo,
        title: 'Assign To',
        type: ColumnType.STRING,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectTaskDetailsTable.assignDate,
        title: 'Assigned Date',
        type: ColumnType.DATE,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectTaskDetailsTable.developmentHours,
        title: 'Development Hours',
        type: ColumnType.NUMBER,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectTaskDetailsTable.description,
        title: 'Description',
        type: ColumnType.STRING,
        onClick: (row, md) => {
          this.descModal.show();
        }
      },
      {
        column: ProjectTaskDetailsTable.status,
        title: 'Status',
        type: ColumnType.STRING,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: ProjectTaskDetailsTable.remarks,
        title: 'Remarks',
        type: ColumnType.STRING,
        onClick: (row, md) => {
          this.remarksModal.show();
        }
      }
    ];
  }
}
