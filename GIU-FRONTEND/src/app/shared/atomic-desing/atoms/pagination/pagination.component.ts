import { Component, Input, Output, EventEmitter, signal, computed, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente atómico de paginación genérica.
 * Recibe el total de items y items por página, emite cambios de página.
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPages() > 1) {
      <div class="pagination">
        <button class="page-btn" (click)="goFirst()" [disabled]="currentPage() === 1" aria-label="Primera página">
          <i class="bi bi-chevron-double-left"></i>
        </button>
        <button class="page-btn" (click)="goPrev()" [disabled]="currentPage() === 1" aria-label="Página anterior">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="page-info">Página {{ currentPage() }} de {{ totalPages() }}</span>
        <button class="page-btn" (click)="goNext()" [disabled]="currentPage() === totalPages()" aria-label="Página siguiente">
          <i class="bi bi-chevron-right"></i>
        </button>
        <button class="page-btn" (click)="goLast()" [disabled]="currentPage() === totalPages()" aria-label="Última página">
          <i class="bi bi-chevron-double-right"></i>
        </button>
      </div>
    }
  `,
  styles: [`
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.5rem;
    }
    .page-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      padding: 0 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      font-size: 0.8125rem;
      color: #1a1a2e;
      transition: all 0.15s ease;
      &:hover:not(:disabled) {
        background: #fee2e2;
        border-color: #e92012;
        color: #e92012;
      }
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
    .page-info {
      font-size: 0.8125rem;
      color: #64748b;
      font-weight: 500;
      padding: 0 0.5rem;
    }
  `],
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems = 0;
  @Input() itemsPerPage = 10;
  @Input() currentPageInput = 1;

  @Output() pageChange = new EventEmitter<number>();

  readonly currentPage = signal(1);
  readonly totalPages = computed(() => Math.ceil(this.totalItems / this.itemsPerPage) || 1);

  ngOnChanges(): void {
    this.currentPage.set(this.currentPageInput);
  }

  goFirst(): void { this.emit(1); }
  goPrev(): void { this.emit(this.currentPage() - 1); }
  goNext(): void { this.emit(this.currentPage() + 1); }
  goLast(): void { this.emit(this.totalPages()); }

  private emit(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.pageChange.emit(page);
    }
  }
}
