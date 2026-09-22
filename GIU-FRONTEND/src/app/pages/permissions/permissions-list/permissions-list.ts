import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoleMockService } from '../../../services/mock/role-mock.service';
import { Resource } from '../../../models/domain/giu.models';
import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';
import { HeaderButton, HeaderPagesComponent } from '../../../shared/molecule/header-pages/header-pages.component';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, HeaderPagesComponent],
  templateUrl: './permissions-list.html',
  styleUrl: './permissions-list.scss',
})
export class PermissionsList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roleService = inject(RoleMockService);

  readonly loading = signal(false);
  readonly recursos = signal<Resource[]>([]);
  readonly searchTerm = signal('');
  readonly filteredRecursos = signal<Resource[]>([]);
  readonly apliId = signal(0);

  // ---------- Configuración del átomo de Tabla ----------
  readonly tableColumnTitle = ['Código', 'Nombre', 'Descripción', 'Tipo', 'Estado'];
  readonly columnsToDisplay = ['codigo', 'nombre', 'descripcion', 'tipo', 'estado'];

  readonly tableData = computed<ColumnConfig[]>(() => {
    return this.filteredRecursos().map((r) => this.buildRow(r));
  });

  private buildRow(r: Resource): ColumnConfig {
    return {
      codigo: { typeColum: typeColum.string, columValue: r.codigo },
      nombre: { typeColum: typeColum.string, columValue: r.nombre },
      descripcion: { typeColum: typeColum.string, columValue: r.descripcion || '—' },
      tipo: { typeColum: typeColum.string, columValue: r.tipo },
      estado: { typeColum: typeColum.status, columValue: r.estado, satusValue: r.estado === 'ACTIVO' },
    } as ColumnConfig;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('apliId'));
    this.apliId.set(id);
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.roleService.listarRecursos(this.apliId()).subscribe({
      next: (res) => { this.recursos.set(res.data ?? []); this.filtrar(); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  filtrar(): void {
    const term = this.searchTerm().toLowerCase();
    this.filteredRecursos.set(
      this.recursos().filter((r) => !term || r.nombre.toLowerCase().includes(term) || r.codigo.toLowerCase().includes(term) || r.tipo.toLowerCase().includes(term))
    );
  }
}
