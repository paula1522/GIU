import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { AuditMockService } from '../../services/mock/audit-mock.service';
import { AuditEvent, AuditFilter } from '../../models/domain/giu.models';
import { TableComponent } from '../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, ActionButton, typeColum } from '../../shared/atomic-desing/atoms/table/table.interface';
import { InputComponent } from '../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { SelectComponent } from '../../shared/atomic-desing/atoms/select/select.component';
import { ButtonComponent } from '../../shared/atomic-desing/atoms/button/button.component';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableComponent, InputComponent, SelectComponent, ButtonComponent],
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export class Audit implements OnInit {
  private readonly auditService = inject(AuditMockService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly eventos = signal<AuditEvent[]>([]);
  readonly eventoSeleccionado = signal<AuditEvent | null>(null);

  filterForm!: FormGroup;

  // Opciones para los selects
  readonly entidadOptions = [
    { id: '', nameSelect: 'Todas' },
    { id: 'APLICACION', nameSelect: 'Aplicación' },
    { id: 'USUARIO', nameSelect: 'Usuario' },
    { id: 'ROL', nameSelect: 'Rol' },
    { id: 'ADMINISTRADOR', nameSelect: 'Administrador' },
  ];
  readonly resultadoOptions = [
    { id: '', nameSelect: 'Todos' },
    { id: 'EXITOSO', nameSelect: 'Exitoso' },
    { id: 'ERROR', nameSelect: 'Error' },
  ];

  get entidadControl(): FormControl { return this.filterForm.get('entidad') as FormControl; }
  get resultadoControl(): FormControl { return this.filterForm.get('resultado') as FormControl; }

  // ---------- Configuración del átomo de Tabla ----------
  readonly tableColumnTitle = ['Fecha', 'Usuario', 'Acción', 'Entidad', 'Resultado', 'Acciones'];
  readonly columnsToDisplay = ['fecha', 'usuarioRed', 'accion', 'entidad', 'resultado', 'acciones'];

  readonly tableData = computed<ColumnConfig[]>(() => {
    return this.eventos().map((e) => this.buildRow(e));
  });

  private buildRow(e: AuditEvent): ColumnConfig {
    const buttons: ActionButton[] = [
      { label: 'Ver', action: 'VER', title: 'Ver detalle', icon: 'bi bi-eye', styles: 'btn-table-view', type: 'button' },
    ];
    return {
      _event: e,
      fecha: { typeColum: typeColum.string, columValue: this.formatFecha(e.fecha) },
      usuarioRed: { typeColum: typeColum.string, columValue: e.usuarioRed },
      accion: { typeColum: typeColum.string, columValue: e.accion },
      entidad: { typeColum: typeColum.string, columValue: e.entidad || '—' },
      resultado: { typeColum: typeColum.status, columValue: e.resultado, satusValue: e.resultado === 'EXITOSO' },
      acciones: { typeColum: typeColum.button, actionButtons: buttons },
    } as ColumnConfig;
  }

  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const auditEvent: AuditEvent = event.row._event;
    if (event.action === 'VER') {
      this.verDetalle(auditEvent);
    }
  }

  private formatFecha(fecha: string): string {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO') + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      fechaInicio: [''],
      fechaFin: [''],
      usuarioRed: [''],
      aplicacion: [''],
      accion: [''],
      entidad: [''],
      resultado: [''],
    });
    this.consultar();
  }

  consultar(): void {
    this.loading.set(true);
    const v = this.filterForm.getRawValue();
    const filtros: AuditFilter = {
      fechaInicio: v.fechaInicio || undefined, fechaFin: v.fechaFin || undefined,
      usuarioRed: v.usuarioRed || undefined, aplicacion: v.aplicacion || undefined,
      accion: v.accion || undefined, entidad: v.entidad || undefined, resultado: v.resultado || undefined,
    };
    this.auditService.consultar(filtros).subscribe({
      next: (res) => { this.eventos.set(res.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  limpiar(): void {
    this.filterForm.reset();
    this.consultar();
  }

  verDetalle(e: AuditEvent): void { this.eventoSeleccionado.set(e); }
  cerrarDetalle(): void { this.eventoSeleccionado.set(null); }

  formatearJson(v?: string): string {
    if (!v) return '—';
    try { return JSON.stringify(JSON.parse(v), null, 2); } catch { return v; }
  }
}
