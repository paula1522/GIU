import { Component } from '@angular/core';
import { APP_ROUTES } from '../../utils/constants/routes.constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-actions',
  imports: [],
  templateUrl: './app-actions.html',
  styleUrl: './app-actions.scss',
})
export class AppActions {
  constructor(
    private router: Router,

  ){

  }

  
  openUser(){
    this.router.navigate([APP_ROUTES.MANAGE_USERS]);
  }
}
