import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserMockService } from '../../../services/mock/user-mock.service';
import { User, UserApplication } from '../../../models/domain/giu.models';
import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, ActionButton, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { HeaderPagesComponent } from '../../../shared/atomic-desing/molecule/header-pages/header-pages.component';

@Component({
  selector: 'app-users-global',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ButtonComponent, HeaderPagesComponent],
  templateUrl: './users-global.html',
  styleUrl: './users-global.scss',
})
export class UsersGlobal implements OnInit {
  private readonly userService = inject(UserMockService);

  readonly loading = signal(false);
  readonly usuarios = signal<User[]>([]);
  readonly searchTerm = signal('');
  readonly filteredUsers = signal<User[]>([]);

  // ---------- Configuración del átomo de Tabla ----------
  readonly tableColumnTitle = ['Usuario Red', 'Nombre', 'Correo', 'Identificación', 'Estado', 'Super Admin', 'Acciones'];
  readonly columnsToDisplay = ['usuarioRed', 'nombre', 'correo', 'numeroIdentificacion', 'estado', 'superAdmin', 'acciones'];

  readonly tableData = computed<ColumnConfig[]>(() => {
    return this.filteredUsers().map((u) => this.buildRow(u));
  });

  private buildRow(u: User): ColumnConfig {
    const buttons: ActionButton[] = [
      { label: 'Detalles', action: 'DETALLES', title: 'Ver detalle del usuario', icon: 'bi bi-info-circle', styles: 'btn-table-view', type: 'button' },
    ];
    return {
      _user: u,
      usuarioRed: { typeColum: typeColum.string, columValue: u.usuarioRed },
      nombre: { typeColum: typeColum.string, columValue: u.nombre },
      correo: { typeColum: typeColum.string, columValue: u.correo || '—' },
      numeroIdentificacion: { typeColum: typeColum.string, columValue: u.numeroIdentificacion },
      estado: { typeColum: typeColum.status, columValue: u.estado, satusValue: u.estado === 'ACTIVO' },
      superAdmin: { typeColum: typeColum.string, columValue: u.superAdministrador === 1 ? 'Sí' : 'No' },
      acciones: { typeColum: typeColum.button, actionButtons: buttons },
    } as ColumnConfig;
  }

  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const user: User = event.row._user;
    if (event.action === 'DETALLES') {
      this.abrirDetalle(user);
    }
  }

  // ---------- Modal de detalle ----------
  readonly showDetalle = signal(false);
  readonly usuarioDetalle = signal<User | null>(null);
  readonly aplicacionesUsuario = signal<UserApplication[]>([]);
  readonly cargandoDetalle = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.userService.listar().subscribe({
      next: (res) => {
        this.usuarios.set(res.data ?? []);
        this.filtrar();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  filtrar(): void {
    const term = this.searchTerm().toLowerCase();
    this.filteredUsers.set(
      this.usuarios().filter(
        (u) => !term || u.usuarioRed.toLowerCase().includes(term) || u.nombre.toLowerCase().includes(term) || (u.correo ?? '').toLowerCase().includes(term)
      )
    );
  }

  abrirDetalle(user: User): void {
    this.usuarioDetalle.set(user);
    this.aplicacionesUsuario.set([]);
    this.showDetalle.set(true);
    this.cargandoDetalle.set(true);
    this.userService.aplicacionesPorUsuario(user.usuarioRed).subscribe({
      next: (res) => {
        this.aplicacionesUsuario.set(res.data ?? []);
        this.cargandoDetalle.set(false);
      },
      error: () => this.cargandoDetalle.set(false),
    });
  }

  cerrarDetalle(): void {
    this.showDetalle.set(false);
    this.usuarioDetalle.set(null);
    this.aplicacionesUsuario.set([]);
  }
}
