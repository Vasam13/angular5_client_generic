import { Row, Status, QueryOperation } from '@types';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { StoreService } from '@StoreService';
import { ColumnMetaData, ColumnType, Store } from '@types';
import { EmailActionsTable } from './../tables/EmailActionsTable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import EmailActionsType from '../tables/types/EmailActionsType';

@Component({
  selector: 'app-email-actions',
  templateUrl: './email-actions.component.html',
  styleUrls: ['./email-actions.component.scss']
})
export class EmailActionsComponent implements OnInit, OnDestroy {
  constructor(private storeService: StoreService) {}
  @ViewChild('contentModal')
  contentModal: ModalDirective;
  @ViewChild('toMailsModal')
  toMailsModal: ModalDirective;
  @ViewChild('ccMailModal')
  ccMailModal: ModalDirective;

  emailActionsStore: Store;
  eventStore: Store;

  toEmails = [];
  ccEmails = [];

  ngOnInit() {
    this.eventStore = this.storeService.getInstance('dummy', 'dummy', []);
    this.eventStore.rows = this.getEvents();
    this.emailActionsStore = this.storeService.getInstance(
      'EmailActions',
      'emailactions',
      this.getColumnsMd(),
      {
        autoQuery: true,
        inserAllowed: true,
        updateAllowed: true,
        deleteAllowed: true
      }
    );
    this.emailActionsStore.beforeInsert = (_row: Row) => {
      _row.toEmails = [];
      _row.ccEmails = [];
      _row.active = 'Y';
      return _row;
    };
    this.emailActionsStore.beforeSave = (dirtyRows: Row[]) => {
      const copy = dirtyRows.map(x => Object.assign({}, x));
      copy.forEach((row: EmailActionsType) => {
        row.toEmails = this.arrayToString(row.toEmails);
        row.ccEmails = this.arrayToString(row.ccEmails);
      });
      return { status: Status.SUCCESS, rows: copy };
    };
    this.emailActionsStore.afterQuery = (rows: Row[]) => {
      rows.forEach((row: EmailActionsType) => {
        row.toEmails = this.strToArray(row.toEmails);
        row.ccEmails = this.strToArray(row.ccEmails);
      });
      return rows;
    };
  }

  save() {
    this.emailActionsStore.save();
  }

  ngOnDestroy() {
    this.emailActionsStore.destroy();
  }

  strToArray(str: any) {
    if (str && str.trim().length > 0) {
      return str.split('$');
    }
    return [];
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

  getColumnsMd = (): ColumnMetaData<EmailActionsTable>[] => {
    return [
      {
        column: EmailActionsTable.datasource,
        title: 'Table Name',
        type: ColumnType.STRING,
        required: true,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: EmailActionsTable.event,
        title: 'Event',
        type: ColumnType.DROP_DOWN,
        dropDownConfiguration: {
          store: this.eventStore,
          displayColumn: 'label',
          valueColumn: 'value'
        },
        required: true,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: EmailActionsTable.condition,
        title: 'Condition',
        type: ColumnType.STRING,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: EmailActionsTable.active,
        title: 'Active',
        type: ColumnType.CHECK_BOX
      },
      {
        column: EmailActionsTable.toEmails,
        title: 'To Emails',
        type: ColumnType.LINK,
        linkConfiguration: {
          text: 'View/Edit',
          onClick: (row, md) => {
            this.toMailsModal.show();
          }
        }
      },
      {
        column: EmailActionsTable.ccEmails,
        title: 'CC Emails',
        type: ColumnType.LINK,
        linkConfiguration: {
          text: 'View/Edit',
          onClick: (row, md) => {
            this.ccMailModal.show();
          }
        }
      },
      {
        column: '',
        title: 'Email Content',
        type: ColumnType.LINK,
        linkConfiguration: {
          text: 'View/Edit',
          onClick: (row, md) => {
            this.contentModal.show();
          }
        }
      }
    ];
  }

  getEvents() {
    return [
      {
        label: 'Before Insert',
        value: 'before_insert',
        $operation$: QueryOperation.QUERY
      },
      {
        label: 'After Insert',
        value: 'after_insert',
        $operation$: QueryOperation.QUERY
      },
      {
        label: 'Before Update',
        value: 'before_update',
        $operation$: QueryOperation.QUERY
      },
      {
        label: 'After Update',
        value: 'after_update',
        $operation$: QueryOperation.QUERY
      },
      {
        label: 'Before Delete',
        value: 'before_delete',
        $operation$: QueryOperation.QUERY
      },
      {
        label: 'After Delete',
        value: 'after_delete',
        $operation$: QueryOperation.QUERY
      }
    ];
  }
}
