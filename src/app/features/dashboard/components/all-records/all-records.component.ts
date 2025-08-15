import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnifiedStateService, Incident } from '../../../../shared/services/unified-state.service';
import { Subscription } from 'rxjs';

type SortKey =
  | 'timestamp'
  | 'initiatorCountry'
  | 'targetCountry'
  | 'sector'
  | 'attackType'
  | 'severity'
  | 'affectedRecords';

@Component({
  selector: 'app-all-records',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-records.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllRecordsComponent implements OnInit, OnDestroy {
  @ViewChild('tbl', { static: true }) tbl!: ElementRef<HTMLDivElement>;

  total = 0;
  pageSize = 200;
  pageIndex = 0;

  sortKey: SortKey = 'timestamp';
  sortDir: 'asc' | 'desc' = 'desc';

  private allRows: Incident[] = [];
  viewRows: Incident[] = [];

  displayStart = 0;
  displayEnd = 0;

  private sub?: Subscription;
  loading = true;

  constructor(private state: UnifiedStateService, private cdr: ChangeDetectorRef) { }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / (this.pageSize || 1)));
  }

  ngOnInit(): void {
    this.state.loadOnce();
    this.sub = this.state.filtered.subscribe((rows) => {
      this.loading = true;
      this.cdr.markForCheck();

      this.allRows = Array.isArray(rows) ? rows : [];
      this.total = this.allRows.length;

      this.applySort(this.sortKey, this.sortDir, false);
      this.pageIndex = 0;
      this.slicePage();

      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  
  sectorOf = (r: any): string =>
    (r?.sector ?? r?.targetSector ?? r?.industry ?? r?.industrySector ?? '') as string;

  attackTypeOf = (r: any): string => (r?.attackType ?? '') as string;

  severityOf = (r: any): string => (r?.severity ?? '') as string;

  affectedRecordsOf = (r: any): number => Number(r?.affectedRecords ?? 0);

  fieldForSort = (r: any, key: SortKey): any => {
    if (key === 'sector') return this.sectorOf(r);
    if (key === 'attackType') return this.attackTypeOf(r);
    if (key === 'severity') return this.severityOf(r);
    if (key === 'affectedRecords') return this.affectedRecordsOf(r);
    return (r as any)?.[key];
  };

  
  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.slicePage();
    }
  }

  nextPage(): void {
    const maxPage = Math.max(0, this.totalPages - 1);
    if (this.pageIndex < maxPage) {
      this.pageIndex++;
      this.slicePage();
    }
  }

  onPageSizeChange(ev: Event): void {
    const val = Number((ev.target as HTMLSelectElement)?.value);
    this.setPageSize(val);
  }

  setPageSize(size: number): void {
    const s = Number(size);
    if (!Number.isFinite(s) || s <= 0) return;
    this.pageSize = Math.min(Math.max(s, 25), 2000);
    this.pageIndex = 0;
    this.slicePage();
  }

  jumpToStart(): void {
    this.pageIndex = 0;
    this.slicePage();
  }

  jumpToEnd(): void {
    this.pageIndex = Math.max(0, this.totalPages - 1);
    this.slicePage();
  }

  
  onSortSelectChange(ev: Event): void {
    const val = (ev.target as HTMLSelectElement)?.value as SortKey;
    if (!val) return;
    this.setSort(val);
  }

  toggleSortDir(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.applySort(this.sortKey, this.sortDir, true);
  }

  setSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = key === 'timestamp' ? 'desc' : 'asc';
    }
    this.applySort(this.sortKey, this.sortDir, true);
  }

  private applySort(key: SortKey, dir: 'asc' | 'desc', refreshPage: boolean): void {
    const mul = dir === 'asc' ? 1 : -1;

    this.allRows = [...this.allRows].sort((a, b) => {
      const va = this.fieldForSort(a, key);
      const vb = this.fieldForSort(b, key);

      if (key === 'timestamp') {
        const ta = typeof va === 'number' ? va : Date.parse(String(va ?? ''));
        const tb = typeof vb === 'number' ? vb : Date.parse(String(vb ?? ''));
        return (ta - tb) * mul;
      }

      if (typeof va === 'number' || typeof vb === 'number') {
        const na = Number(va ?? 0);
        const nb = Number(vb ?? 0);
        return (na - nb) * mul;
      }

      const sa = String(va ?? '').toLowerCase();
      const sb = String(vb ?? '').toLowerCase();
      if (sa < sb) return -1 * mul;
      if (sa > sb) return 1 * mul;
      return 0;
    });

    if (refreshPage) this.slicePage();
  }

  private slicePage(): void {
    const start = this.pageIndex * this.pageSize;
    const end = Math.min(start + this.pageSize, this.total);
    this.viewRows = this.allRows.slice(start, end);

    this.displayStart = this.total ? start + 1 : 0;
    this.displayEnd = end;

    this.cdr.markForCheck();

    queueMicrotask(() => {
      const el = this.tbl?.nativeElement;
      if (el) el.scrollTop = 0;
    });
  }

  
  exportCurrentPage(): void {
    this.exportCsv(this.viewRows, 'all-records-page.csv');
  }

  exportAll(): void {
    this.exportCsv(this.allRows, 'all-records-all.csv');
  }

  private exportCsv(rows: Incident[], filename: string): void {
    if (!rows?.length) return;

    const cols: (keyof Incident | string)[] = [
      'timestamp',
      'initiatorCountry',
      'targetCountry',
      'sector',
      'attackType',
      'severity',
      'affectedRecords',
      'attribution',
      'response',
    ];

    const header = cols.join(',');
    const escape = (v: any) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const valueOf = (r: any, key: string) => {
      switch (key) {
        case 'sector': return this.sectorOf(r);
        case 'attackType': return this.attackTypeOf(r);
        case 'severity': return this.severityOf(r);
        case 'affectedRecords': return this.affectedRecordsOf(r);
        default: return r?.[key] ?? '';
      }
    };

    const chunk = 5000;
    let csv = header + '\n';
    for (let i = 0; i < rows.length; i += chunk) {
      const part = rows
        .slice(i, i + chunk)
        .map((r) => cols.map((c) => escape(valueOf(r, String(c)))).join(','))
        .join('\n');
      csv += part + (i + chunk < rows.length ? '\n' : '');
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  
  trackRow = (i: number, r: Incident) => (r as any)?.id ?? i;
}
