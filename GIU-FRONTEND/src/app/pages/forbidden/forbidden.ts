import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <div class="error-code">403</div>
      <h1>Acceso denegado</h1>
      <p>No dispone del permiso requerido para acceder a esta página.</p>
      <a routerLink="/dashboard" class="btn-primary">Volver al inicio</a>
    </div>
  `,
  styles: [`
    .error-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem; background: #f7f1f1; }
    .error-code { font-size: 5rem; font-weight: 700; color: #e92012; }
    h1 { font-size: 1.5rem; margin: 1rem 0 0.5rem; color: #1a1a2e; }
    p { color: #64748b; margin-bottom: 1.5rem; }
    .btn-primary { padding: 0.5rem 1rem; background: #e92012; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 500; text-decoration: none; &:hover { background: #ce1104; } }
  `],
})
export class Forbidden {}
