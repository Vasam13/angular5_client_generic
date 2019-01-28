import { Row } from '@types';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import * as moment from 'moment';

@Component({
  selector: 'app-attendence',
  templateUrl: './attendence.component.html',
  styleUrls: ['./attendence.component.scss']
})
export class AttendenceComponent implements OnInit {
  @Input()
  employeeRow: Row;
  viewType = 'calender';

  momentDateFormat = 'YYYY-MM-DD';
  calendarOptions: Options;
  calenderSelctedDate: any = moment();
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  constructor() {}

  ngOnInit() {
    const dateObj = new Date();
    const yearMonth =
      dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1);
    this.calendarOptions = {
      editable: true,
      eventLimit: false,
      header: {
        left: 'prev,next today',
        center: 'title',
        right: null
      },
      events: [
        {
          title: 'ES',
          start: yearMonth,
          className: 'calnder-employee-shift',
          allDay: false
        },
        {
          title: 'P',
          start: yearMonth,
          className: ['calnder-employee-attendence', 'attendence-present'],
          allDay: true
        },
        {
          title: 'ES',
          start: yearMonth + '-2',
          className: 'calnder-employee-shift',
          allDay: false
        },
        {
          title: 'A',
          start: yearMonth + '-2',
          className: ['calnder-employee-attendence', 'attendence-absent'],
          allDay: true
        },
        {
          title: 'GS',
          start: yearMonth + '-3',
          className: 'calnder-employee-shift',
          allDay: false
        },
        {
          title: 'H',
          start: yearMonth + '-3',
          className: ['calnder-employee-attendence', 'attendence-holiday'],
          allDay: true
        }
      ]
    };
  }

  queryCalnderStore() {
    const selectedDate = this.calenderSelctedDate.format(this.momentDateFormat);
    console.log(selectedDate);
  }

  calnderButtonClick(model: any) {
    if (model.buttonType === 'today') {
      this.calenderSelctedDate = model.data;
      this.queryCalnderStore();
    }
  }

  eventClick(model: any) {
    this.calenderSelctedDate = model.event.start;
    this.queryCalnderStore();
  }
}
