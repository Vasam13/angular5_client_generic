import { filter } from 'rxjs/operators/filter';
import { Store, ColumnType } from '@types';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { MessageService } from '@message';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
  constructor() {}

  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  scrollBarHorizontal = window.innerWidth < 960;
  columnModeSetting = window.innerWidth < 960 ? 'standard' : 'force';

  @Input()
  store: Store;
  @Output()
  rowSelected = new EventEmitter();

  @Input()
  filter: string;

  convert = str => {
    const date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join('/');
  }

  isVisible(row, md) {
    if (md.visible) {
      return md.visible(row, md);
    }
    return true;
  }

  isSelectColumn(md) {
    return md.type === 'select' && md.dropDownConfiguration;
  }

  isCheckboxColumn(md) {
    return md.type === 'checkbox';
  }

  getCheckboxValue(row, md) {
    return row[md.column] === 'Y';
  }

  getInputType(columnMD) {
    if (columnMD.type === ColumnType.DATE && !columnMD.updateAllowed) {
      return ColumnType.STRING;
    }
    return columnMD.type;
  }

  convertDate = (str: string) => {
    if (str && str.trim().length > 0 && str.indexOf('-') > -1) {
      const arr = str.split('-');
      if (arr.length === 3) {
        return [arr[2], arr[1], arr[0]].join('/');
      }
      return str;
    }
    return str;
  }

  getValue(columnMD, row) {
    if (columnMD.type === ColumnType.DATE && !columnMD.updateAllowed) {
      return this.convertDate(row[columnMD.column]);
    }
    return row[columnMD.column];
  }

  onCheckboxChanged(row, md) {
    row[md.column] = row[md.column] ? 'Y' : 'N';
  }

  getSelectDisplayValue(row, md) {
    if (!this.isSelectColumn(md)) {
      return '';
    }
    const config = md.dropDownConfiguration;
    const fil = config.store.rows.filter(
      selectRow => row[md.column] === selectRow[config.valueColumn]
    );
    return fil.length > 0 ? fil[0][config.displayColumn] : '';
  }

  filterStoreRows(store: Store) {
    return store.rows.filter(row => {
      // return Object.keys(row).some(k => {
      //   return row[k] === this.filter;
      // });
      const keys = Object.keys(row);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!key.startsWith('$') && row[key] !== null) {
          let rowValue;
          if (row[key] instanceof Date) {
            rowValue = this.convert(row[key]);
          } else {
            rowValue = row[key].toString().toLowerCase();
          }
          const filterValue = this.filter.toString().toLowerCase();
          const _index = rowValue.indexOf(filterValue);
          if (_index > -1) {
            return true;
          }
        }
      }
      return false;
    });
  }

  getRows() {
    if (this.filter && this.filter.trim().length > 0 && this.store.rows) {
      const filtered = this.filterStoreRows(this.store);
      return filtered || [];
    }
    return this.store.rows || [];
  }

  ngOnInit() {}
}
