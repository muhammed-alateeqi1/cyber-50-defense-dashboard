import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnifiedStateService, Incident } from '../../../../shared/services/unified-state.service';

@Component({
  selector: 'app-key-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './key-insights.component.html',
  styleUrl: './key-insights.component.css'
})
export class KeyInsightsComponent implements OnInit {
  total = 0;
  range = { min: '', max: '' };
  topTargetCountry = '-';
  topInitiatorCountry = '-';
  topAttackType = '-';
  topSector = '-';

  constructor(private state: UnifiedStateService) {}

  ngOnInit() {
    this.state.loadOnce();
    this.state.rawData.subscribe(rows => {
      const data = rows ?? [];
      this.total = data.length;
      // range
      const dates = data.map(r => new Date(r.timestamp)).filter(d => !isNaN(+d)).sort((a,b)=>+a-+b);
      this.range.min = dates.length ? toISO(dates[0]) : '';
      this.range.max = dates.length ? toISO(dates[dates.length-1]) : '';
      // helpers
      const top = (arr: any[], key: keyof Incident) => {
        const m = new Map<string, number>();
        for (const r of arr) {
          const v = String((r as any)[key] ?? '').trim();
          if (!v) continue;
          m.set(v, (m.get(v) ?? 0) + 1);
        }
        const it = Array.from(m.entries()).sort((a,b)=> b[1]-a[1])[0];
        return it ? it[0] : '-';
      };
      this.topTargetCountry = top(data, 'targetCountry');
      this.topInitiatorCountry = top(data, 'initiatorCountry');
      this.topAttackType = top(data, 'attackType');
      this.topSector = top(data, 'targetSector');
    });
  }
}

function toISO(d: Date) {
  const y=d.getUTCFullYear(); const m=String(d.getUTCMonth()+1).padStart(2,'0'); const da=String(d.getUTCDate()).padStart(2,'0');
  return `${y}-${m}-${da}`;
}
