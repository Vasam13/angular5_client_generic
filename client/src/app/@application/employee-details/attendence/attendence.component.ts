import { Row } from '@types';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-attendence',
  templateUrl: './attendence.component.html',
  styleUrls: ['./attendence.component.scss']
})
export class AttendenceComponent implements OnInit {
  @Input()
  employeeRow: Row;
  viewType = 'calender';

  constructor() {}

  ngOnInit() {}
}
