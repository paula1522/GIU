import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserMockService } from '../../../services/mock/user-mock.service';
import { User } from '../../../models/domain/giu.models';
import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';

@Component({
  selector: 'app-users-global',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent],
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
  readonly tableColumnTitle = ['Usuario Red', 'Nombre', 'Correo', 'Identificación', 'Estado', 'Super Admin'];
  readonly columnsToDisplay = ['usuarioRed', 'nombre', 'correo', 'numeroIdentificacion', 'estado', 'superAdmin'];

  readonly tableData = computed<ColumnConfig[]>(() => {
    return this.filteredUsers().map((u) => this.buildRow(u));
  });

  private buildRow(u: User): ColumnConfig {
    return {
      usuarioRed: { typeColum: typeColum.string, columValue: u.usuarioRed },
      nombre: { typeColum: typeColum.string, columValue: u.nombre },
      correo: { typeColum: typeColum.string, columValue: u.correo || '—' },
      numeroIdentificacion: { typeColum: typeColum.string, columValue: u.numeroIdentificacion },
      estado: { typeColum: typeColum.status, columValue: u.estado, satusValue: u.estado === 'ACTIVO' },
      superAdmin: { typeColum: typeColum.string, columValue: u.superAdministrador === 1 ? 'Sí' : 'No' },
    } as ColumnConfig;
  }

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
}
