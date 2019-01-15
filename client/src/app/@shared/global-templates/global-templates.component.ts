import { Row, Status, QueryOperation } from '@types';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { StoreService } from '@StoreService';
import { ColumnMetaData, ColumnType, Store } from '@types';
import { GlobalTemplatesTable } from './../tables/GlobalTemplatesTable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import GlobalTemplatesType from '../tables/types/GlobalTemplatesType';

@Component({
  selector: 'app-global-templates',
  templateUrl: './global-templates.component.html',
  styleUrls: ['./global-templates.component.scss']
})
export class GlobalTemplatesComponent implements OnInit, OnDestroy {
  constructor(private storeService: StoreService) {}
  @ViewChild('contentModal')
  contentModal: ModalDirective;

  templatesStore: Store;

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }]
    ]
  };

  ngOnInit() {
    this.templatesStore = this.storeService.getInstance(
      'GlobalTemplates',
      'globaltemplates',
      this.getColumnsMd(),
      {
        autoQuery: true,
        inserAllowed: true,
        updateAllowed: true,
        deleteAllowed: true
      }
    );
  }
  ngOnDestroy() {
    this.templatesStore.destroy();
  }
  getColumnsMd = (): ColumnMetaData<GlobalTemplatesTable>[] => {
    return [
      {
        column: GlobalTemplatesTable.templateCode,
        title: 'Code',
        type: ColumnType.STRING,
        required: true,
        inserAllowed: true,
        updateAllowed: false,
        maxWidth: 300
      },
      {
        column: GlobalTemplatesTable.title,
        title: 'Title',
        type: ColumnType.STRING,
        required: true,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: GlobalTemplatesTable.content,
        title: 'Content',
        type: ColumnType.LINK,
        maxWidth: 300,
        linkConfiguration: {
          text: 'View/Edit',
          onClick: (row, md) => {
            this.contentModal.show();
          }
        }
      }
    ];
  }
}
