import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ColumnConfig } from './table.interface';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent
  ],
})
export class TableComponent {
  @Input() tableTitle: string = '';
  @Input() tableColumnTitle: string[] = [];
  @Input() columnsToDisplay: string[] = [];
  @Input() dataSource: ColumnConfig[] = [];
  @Input() showPaginator: boolean = false;
  @Input() totalRegistros: number = 0; // Número de elementos completos
  @Input() totalItemsPerPag = 10;// Número de elementos por página
  @Output() clickEventButton = new EventEmitter<{ action: string; row: any, idTable: string }>();
  @Input() idTable:string = '';// id de la tabla
  @Input() enableSort: boolean = true; // Habilita ordenamiento por columnas

  // Variables para paginación
  currentPageIndex:any = 1; // Índice de la primera página
  paginatedData: any[] = [];
  pagesToShow: (number | string)[] = [];
  totalPages: number = 0;

  // Variables para ordenamiento
  sortColumn: number = -1; // Índice de la columna ordenada (-1 = ninguna)
  sortDirection: 'asc' | 'desc' | null = null; // null = sin ordenar

  // Event emitter for pagination actions
  @Output() pageChange = new EventEmitter<number>();

  ngOnInit(): void {
    this.totalRegistros = this.dataSource.length;
    this.calculateTotalPages();
    this.updatePaginatedData();
  }

  /*
  metodo que recibe las actualizaciones de los parametros de entrada de la clase y actualiza en caso de ser necesarias las variables
  */
  ngOnChanges(changes: SimpleChanges): void {    
    
    if (changes['dataSource']) {
      this.dataSource = changes['dataSource'].currentValue;
      this.totalRegistros = this.dataSource.length;
      this.currentPageIndex = 1;
      this.calculateTotalPages();
      this.updatePaginatedData();
    }
  }

  calculateTotalPages() {
    this.totalPages =  Math.ceil(this.totalRegistros / this.totalItemsPerPag);
    this.updatePagesToShow();
  }

  updatePaginatedData() {
    let data = [...this.dataSource];
    // Aplicar ordenamiento si hay columna seleccionada
    if (this.sortColumn >= 0 && this.sortDirection && this.columnsToDisplay[this.sortColumn]) {
      const col = this.columnsToDisplay[this.sortColumn];
      data.sort((a: any, b: any) => {
        const valA = a[col]?.columValue ?? a[col]?.switchValue ?? '';
        const valB = b[col]?.columValue ?? b[col]?.switchValue ?? '';
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return this.sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    const start = (this.currentPageIndex - 1) * this.totalItemsPerPag;
    const end = start + this.totalItemsPerPag;
    this.paginatedData = data.slice(start, end);
  }

  /**
   * Alterna el ordenamiento de una columna: asc -> desc -> sin orden -> asc
   */
  toggleSort(colIndex: number): void {
    if (!this.enableSort) return;
    if (this.sortColumn === colIndex) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = null;
        this.sortColumn = -1;
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortColumn = colIndex;
      this.sortDirection = 'asc';
    }
    this.currentPageIndex = 1;
    this.updatePaginatedData();
    this.updatePagesToShow();
  }

  /** Retorna el ícono de ordenamiento para una columna. */
  getSortIcon(colIndex: number): string {
    if (this.sortColumn !== colIndex || !this.sortDirection) return 'bi bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down';
  }

  goToFirstPage() {
    this.currentPageIndex = 1;
    this.updatePaginatedData();
    this.updatePagesToShow();
  }

  /**
   * ir a la pagina anterior
   */
  previousPage() {
    if (this.currentPageIndex > 1) {
      this.currentPageIndex--;
      this.updatePaginatedData();
      this.updatePagesToShow();
    }
  }

  /**
   * ir a una pagina en especifico
   * @param page : numero de la pagina a donde se quieren dirigir 
   */
  goToPage(page: number|string): void {
    this.currentPageIndex = page;
    this.updatePaginatedData();
    this.updatePagesToShow();
  }

  /**
   * ir a la siguiente pagina
   */
  nextPage() {
    if (this.currentPageIndex < this.totalPages) {
      this.currentPageIndex++;
      this.updatePaginatedData();
      this.updatePagesToShow();
    }
  }

  /**
   * ir a la ultima pagina que hay
   */
  goToLastPage() {
    this.currentPageIndex = this.totalPages;
    this.updatePaginatedData();
    this.updatePagesToShow();
  }

  updateRecordsPerPage() {
    if (!this.totalItemsPerPag || this.totalItemsPerPag <= 0) {
      this.totalItemsPerPag = 10; // Valor por defecto
    }
    this.currentPageIndex = 1;
    this.calculateTotalPages();
    this.updatePaginatedData();
  }

  /**
   * Metodo que emite un evento cuando se da clic en alguno de los botones de la tabla
   * @param item registro de la tabla que fue seleccionado
   * @param action es el nombre del boton que fue seleccionado para que el usuario sepa que presionaron dicha accion
   */
  onAction(item:any, action: string) {
    let row:any = item;
    let idTable: string = this.idTable;
    this.clickEventButton.emit({ action, row, idTable });
  }
  /**
   * Metodo que emite un evento cuando se modifica el valor del input switch
   * @param item registro de la tabla que fue seleccionado
   * @param event objeto que llega del input switch { column: string;  row: { key: string, value: any, check: boolean } }
   */
  onSwitchChange(item:any, event: any) {
    const column = event.column;
    item[column] = event.row.value;
    let idTable: string = this.idTable;
    this.clickEventButton.emit({ action: column, row: item, idTable: idTable });
  }

  /**
   * Maneja el cambio de un switch en la tabla.
   */
  onSwitchToggle(item: any, column: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    item[column].switchValue = checked;
    const action = item[column].switchAction || column;
    this.clickEventButton.emit({ action, row: item, idTable: this.idTable });
  }

  updatePagesToShow() {
    const maxPagesToShow = 5; // Número máximo de páginas a mostrar
    const halfWindow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(this.currentPageIndex - halfWindow, 1);
    let endPage = Math.min(this.currentPageIndex + halfWindow, this.totalPages);

    if (endPage - startPage + 1 < maxPagesToShow) {
      if (this.currentPageIndex <= halfWindow) {
        endPage = Math.min(maxPagesToShow, this.totalPages);
      } else {
        startPage = Math.max(this.totalPages - maxPagesToShow + 1, 1);
      }
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (startPage > 1) {
      pages.unshift('...');
      pages.unshift(1);
    }

    if (endPage < this.totalPages) {
      pages.push('...');
      pages.push(this.totalPages);
    }

    this.pagesToShow = pages;
  }

 
}

