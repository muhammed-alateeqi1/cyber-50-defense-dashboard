import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

interface LegendItem {
  label: string;
  value: number;
  pct: number;
  color: string;
}

@Component({
  selector: 'app-chart-pie',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="flex gap-6 items-start">
  <div #host class="flex-1 min-h-[260px]"></div>

  <!-- Legend -->
  <div class="w-64" *ngIf="legend.length">
    <div *ngFor="let it of legend" class="flex items-center justify-between mb-2 text-sm">
      <span class="inline-flex items-center gap-2">
        <span class="inline-block w-3 h-3 rounded" [style.backgroundColor]="it.color"></span>
        {{ it.label }}
      </span>
      <span class="text-gray-600">{{ it.value }} ({{ it.pct }}%)</span>
    </div>
  </div>
</div>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartPieComponent implements OnChanges, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  /** بيانات بصيغة [{label, value}] */
  @Input() data: Array<{ label: string; value: number }> = [];
  /** الارتفاع المطلوب للـ SVG */
  @Input() height = 360;
  /** لوحة ألوان اختيارية */
  @Input() palette: string[] | null = null;

  legend: LegendItem[] = [];
  private cleanup: (() => void) | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.render();
  }

  private render() {
    if (!this.host) return;
    if (this.cleanup) this.cleanup();

    const el = this.host.nativeElement;
    const width = el.clientWidth || 600;
    const height = this.height;
    const r = Math.min(width, height) / 2;

    const svg = d3
      .select(el)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const total = this.data.reduce((s, d) => s + Math.max(0, d.value), 0);
    const labels = this.data.map((d) => d.label);

    const colors =
      this.palette && this.palette.length
        ? this.palette
        : [
          '#2563eb',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#84cc16',
          '#f43f5e',
          '#0ea5e9',
          '#a855f7',
          '#14b8a6',
          '#eab308',
        ];

    const color = d3.scaleOrdinal<string, string>().domain(labels).range(colors);

    const pie = d3
      .pie<{ label: string; value: number }>()
      .sort(null)
      .value((d) => Math.max(0, d.value));

    const arc = d3
      .arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(r * 0.55) // Donut
      .outerRadius(r - 4);

    const arcs = g
      .selectAll('path')
      .data(pie(this.data))
      .enter()
      .append('path')
      .attr('d', (d: any) => arc(d) as any)
      .attr('fill', (d: any) => color(d.data.label))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    // Tooltip بسيط
    arcs.append('title').text((d: any) => {
      const pct = total ? Math.round((d.data.value / total) * 100) : 0;
      return `${d.data.label}: ${d.data.value} (${pct}%)`;
    });

    // بيانات الـ Legend
    this.legend = this.data
      .map((d) => ({
        label: d.label,
        value: d.value,
        pct: total ? Math.round((d.value / total) * 100) : 0,
        color: color(d.label),
      }))
      .sort((a, b) => b.value - a.value);

    // إعادة الرسم عند تغيير الحجم
    const ro = new ResizeObserver(() => this.render());
    ro.observe(el);

    this.cleanup = () => {
      ro.disconnect();
      svg.remove();
    };

    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    if (this.cleanup) this.cleanup();
  }
}
