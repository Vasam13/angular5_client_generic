import { Injectable } from '@angular/core';
import { CondensedComponent } from '../@pages/layouts';
import { SalesComponent } from '../@application/sales/sales.component';

@Injectable()
export class ComponentUtility {
  static getInstance(str: string) {
    if (str === 'CondensedComponent') {
      return CondensedComponent;
    } else if (str === 'SalesComponent') {
      return SalesComponent;
    }
  }
}
