import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { baseUrl } from '../../base/baseUrl';

export interface Incident {
  id: string;
  timestamp: string;
  attackType: string;
  severity: string;
  targetCountry: string;
  targetSector: string;
  initiatorCountry: string;
  initiatorType: string;
  response: string;
  attributedTo?: string;
  affectedRecords?: number;
  estimatedDowntimeHours?: number;
}

export interface Filters {
  dateFrom?: string | null;
  dateTo?: string | null;
  targetCountry?: string | null;
  targetSector?: string | null;
  attackType?: string | null;
  severity?: string | null;
  initiatorCountry?: string | null;
  initiatorType?: string | null;
  attribution?: string | null;
  search?: string | null;
}

type Bucket = 'day' | 'week' | 'month';
type Field =
  | 'attackType'
  | 'severity'
  | 'targetCountry'
  | 'targetSector'
  | 'initiatorCountry'
  | 'initiatorType'
  | 'response'
  | 'attributedTo';

@Injectable({ providedIn: 'root' })
export class UnifiedStateService {
  private apiUrl = `${baseUrl.baseUrl}incidents.json`;

  private data$ = new BehaviorSubject<Incident[] | null>(null);
  private filters$ = new BehaviorSubject<Filters>({});
  private bounds$ = new BehaviorSubject<{minDate: string|null; maxDate: string|null}>({minDate:null,maxDate:null});
  private options$ = new BehaviorSubject<{
    attackTypes: string[]; severities: string[]; targetCountries: string[]; targetSectors: string[];
    initiatorCountries: string[]; initiatorTypes: string[]; responses: string[]; attributions: string[];
  }>({
    attackTypes: [], severities: [], targetCountries: [], targetSectors: [],
    initiatorCountries: [], initiatorTypes: [], responses: [], attributions: []
  });

  constructor(private http: HttpClient) {}

  loadOnce(): void {
    if (this.data$.value) return;
    this.http.get<any>(this.apiUrl).subscribe((raw) => {
      const arr: Incident[] = (raw?.incidents ?? [])
        .map((r: any) => ({
          id: S(r.id),
          timestamp: S(r.timestamp ?? r.date),
          attackType: T(r.attackType),
          severity: T(r.severity),
          targetCountry: T(r.targetCountry),
          targetSector: T(r.targetSector),
          initiatorCountry: T(r.initiatorCountry),
          initiatorType: T(r.initiatorType),
          response: T(r.response),
          attributedTo: T(r.attributedTo),
          affectedRecords: toNum(r.affectedRecords),
          estimatedDowntimeHours: toNum(r.estimatedDowntimeHours),
        }))
        .filter((x: Incident) => !!x.timestamp);

      
      const dates = arr
        .map((d: Incident) => D(d.timestamp))
        .filter((d: Date | null): d is Date => d !== null)
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());
      const minDate = dates.length ? toISOdate(dates[0]) : null;
      const maxDate = dates.length ? toISOdate(dates[dates.length-1]) : null;
      this.bounds$.next({minDate, maxDate});

      
      const uniq = (xs: Array<string | undefined>): string[] =>
        Array.from(new Set(xs.map((s) => S(s)).filter((v) => !!v))).sort((a,b)=> a.localeCompare(b));
      this.options$.next({
        attackTypes: uniq(arr.map(x => x.attackType)),
        severities: uniq(arr.map(x => x.severity)),
        targetCountries: uniq(arr.map(x => x.targetCountry)),
        targetSectors: uniq(arr.map(x => x.targetSector)),
        initiatorCountries: uniq(arr.map(x => x.initiatorCountry)),
        initiatorTypes: uniq(arr.map(x => x.initiatorType)),
        responses: uniq(arr.map(x => x.response)),
        attributions: uniq(arr.map(x => x.attributedTo)),
      });

      
      const f0: Filters = { ...this.filters$.value };
      if (minDate && !f0.dateFrom) f0.dateFrom = minDate;
      if (maxDate && !f0.dateTo) f0.dateTo = maxDate;
      this.filters$.next(f0);

      this.data$.next(arr);
    });
  }

  
  get rawData(): Observable<Incident[] | null> { return this.data$.asObservable(); }

  setFilters(patch: Partial<Filters>): void {
    const cur = { ...this.filters$.value, ...patch };
    const b = this.bounds$.value;
    if (b.minDate && cur.dateFrom && cur.dateFrom < b.minDate) cur.dateFrom = b.minDate;
    if (b.maxDate && cur.dateTo && cur.dateTo > b.maxDate) cur.dateTo = b.maxDate;
    this.filters$.next(cur);
  }

  get bounds(): Observable<{minDate: string|null; maxDate: string|null}> { return this.bounds$.asObservable(); }
  get options(): Observable<{
    attackTypes: string[]; severities: string[]; targetCountries: string[]; targetSectors: string[];
    initiatorCountries: string[]; initiatorTypes: string[]; responses: string[]; attributions: string[];
  }> { return this.options$.asObservable(); }

  get filters(): Observable<Filters> { return this.filters$.asObservable(); }
  get data(): Observable<Incident[] | null> { return this.data$.asObservable(); }

  get filtered(): Observable<Incident[]> {
    return combineLatest([this.data$, this.filters$]).pipe(
      map(([data, f]) => {
        if (!data) return [];
        const from = f.dateFrom ? new Date(f.dateFrom) : null;
        const to = f.dateTo ? new Date(f.dateTo) : null;
        const q = (f.search ?? '').toLowerCase().trim();
        const eq = (a?: string | null, b?: string | null) => !b || S(a).toLowerCase() === S(b).toLowerCase();

        return data.filter((d: Incident) => {
          const t = D(d.timestamp);
          if (!t) return false;
          if (from && t < from) return false;
          if (to && t > to) return false;
          if (!eq(d.targetCountry, f.targetCountry)) return false;
          if (!eq(d.targetSector, f.targetSector)) return false;
          if (!eq(d.attackType, f.attackType)) return false;
          if (!eq(d.severity, f.severity)) return false;
          if (!eq(d.initiatorCountry, f.initiatorCountry)) return false;
          if (!eq(d.initiatorType, f.initiatorType)) return false;
          if (!eq(d.attributedTo, f.attribution)) return false;
          if (q) {
            const blob =
              `${d.id} ${d.attackType} ${d.severity} ${d.targetCountry} ${d.targetSector} ${d.initiatorCountry} ${d.initiatorType} ${d.response} ${d.attributedTo ?? ''}`.toLowerCase();
            if (!blob.includes(q)) return false;
          }
          return true;
        });
      })
    );
  }

  timeSeriesSimple(input: Incident[], bucket: Bucket = 'month'): Array<{ label: string; value: number }> {
    const res = this.timeSeries(input, bucket) as Array<{ label: string; value: number }> | {
      keys: string[];
      rows: Array<{ label: string; series: Array<{ name: string; value: number }> }>;
    };
    return Array.isArray(res) ? res : [];
  }

  timeSeries(
    input: Incident[],
    bucket: Bucket = 'month',
    groupBy?: Field
  ):
    | Array<{ label: string; value: number }>
    | { keys: string[]; rows: Array<{ label: string; series: Array<{ name: string; value: number }> }> } {
    const fmt = (d: Date) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const da = String(d.getUTCDate()).padStart(2, '0');
      if (bucket === 'day') return `${y}-${m}-${da}`;
      if (bucket === 'week') {
        const first = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const days = Math.floor((d.getTime() - first.getTime()) / 86400000);
        const week = Math.floor(days / 7) + 1;
        return `${y}-W${String(week).padStart(2, '0')}`;
      }
      return `${y}-${m}`;
    };

    if (groupBy) {
      const cats = new Map<string, Map<string, number>>();
      for (const r of input) {
        const t = D(r.timestamp); if (!t) continue;
        const key = fmt(t);
        const cat = S((r as any)[groupBy]);
        if (!cats.has(cat)) cats.set(cat, new Map<string, number>());
        const m = cats.get(cat)!;
        m.set(key, (m.get(key) ?? 0) + 1);
      }
      const allKeys = new Set<string>();
      cats.forEach((m) => m.forEach((_, k) => allKeys.add(k)));
      const sorted = Array.from(allKeys).sort();
      const rows = Array.from(cats.entries()).map(([cat, m]) => ({
        label: cat,
        series: sorted.map((k) => ({ name: k, value: m.get(k) ?? 0 })),
      }));
      return { keys: sorted, rows };
    } else {
      const acc = new Map<string, number>();
      for (const r of input) {
        const t = D(r.timestamp); if (!t) continue;
        const key = fmt(t);
        acc.set(key, (acc.get(key) ?? 0) + 1);
      }
      return Array.from(acc.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([label, value]) => ({ label, value }));
    }
  }

  topN(input: Incident[], field: Field, n = 10): Array<{ label: string; value: number }> {
    const counts = new Map<string, number>();
    for (const r of input) {
      const k = S((r as any)[field]);
      if (!k) continue;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, n);
  }

  distribution(input: Incident[], field: Field): Array<{ label: string; value: number }> {
    return this.topN(input, field, Number.MAX_SAFE_INTEGER);
  }
}

function S(v: any): string { return (v ?? '').toString().trim(); }
function T(v: any): string { const s = S(v); if (!s) return ''; return s.replace(/\s+/g,' ').toLowerCase().replace(/\b\w/g,(c: string)=>c.toUpperCase()); }
function toNum(v: any): number | undefined { const n = Number(v); return Number.isFinite(n) ? n : undefined; }
function D(s: string): Date | null { const d = new Date(s); return isNaN(+d) ? null : d; }
function toISOdate(d: Date): string { const y=d.getUTCFullYear(); const m=String(d.getUTCMonth()+1).padStart(2,'0'); const da=String(d.getUTCDate()).padStart(2,'0'); return `${y}-${m}-${da}`; }
