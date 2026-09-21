import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/atomic-desing/atoms/button/button.component';
import { InputComponent } from '../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { TableComponent } from '../../shared/atomic-desing/atoms/table/table.component';

@Component({
  selector: 'app-manage-users',
  imports: [ButtonComponent, InputComponent,TableComponent],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.scss',
})
export class ManageUsers {
  searchTerm = '';
  dataSource: any[] = [];
  tableTitles: string[] = ['acciones'];
  tableColumns: string[] = ['acciones'];
  tableTitle: string = 'Lista de Usuarios';
  constructor(

  ){

  }

  consultInfoUserAccounts() {
    this.dataSource = [];
    if (this.tableColumns.length === 1) {
      this.tableColumns = [
        'id',
        'status',
        'nameUser',
        'addres',
        'country',
        'feasibility',
        'owner',
        ...this.tableColumns
      ];
    }
    if (this.tableTitles.length === 1) {
      this.tableTitles = [
        'No.',
        'Estado',
        'Nombre titular',
        'Dirección',
        'Ciudad',
        'Factibilidad',
        'Proveedor de cable',
        ...this.tableTitles
      ];
    }
  }

  actionTable(data: { action: string; row: any }) {

  }

  onAddUser(): void {
    // abrir modal / navegar a formulario de creación
  }

  onSearch(term: string): void {
    // filtrar usuarios o llamar al servicio con debounce
  }

}
