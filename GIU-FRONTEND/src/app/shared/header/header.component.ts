import { Component , } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, CommonModule } from '@angular/common';
import {  RouterModule } from '@angular/router';
import { APP_ROUTES } from '../../utils/constants/routes.constants';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  userName = 'Usuario';
  showUserMenu = false;
  constructor(

    private router: Router,
  ){

  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.showUserMenu = false;
  
      this.router.navigate([APP_ROUTES.LOGIN]);
    
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

}
