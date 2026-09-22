import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly title = signal('GIU-FRONTEND');
  private router = inject(Router);

  isLoginPage(): boolean {
    return this.router.url.startsWith('/login');
  }
}
