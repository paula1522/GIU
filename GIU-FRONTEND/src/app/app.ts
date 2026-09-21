import { Component, signal, inject  } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('GIU-FRONTEND');
  private router = inject(Router);

  showHeader(): boolean {
    return !this.router.url.startsWith('/login');
  }
}
