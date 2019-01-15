import { Utils } from '@utils';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import RootScope from '@RootScope';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    const cookie = Utils.getCookie();
    if (!cookie) {
      this.router.navigate(['/login']);
    } else {
      RootScope.userInfo = cookie;
    }
  }
}
