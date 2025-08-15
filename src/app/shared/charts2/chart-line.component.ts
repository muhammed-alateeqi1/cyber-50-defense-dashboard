import { Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart-line',
  standalone: true,
  template: `<div #host class="w-full h-full"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartLineComponent implements OnChanges, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;
  @Input() data: Array<{ label: string; value: number }> = [];
  @Input() height = 360;
  private cleanup: (() => void) | null = null;

  ngOnChanges() { this.render(); }

  private render() {
    if (this.cleanup) this.cleanup();
    const el = this.host.nativeElement;
    const width = el.clientWidth || 800;
    const height = this.height;
    const margin = { top: 16, right: 16, bottom: 36, left: 56 };

    const svg = d3.select(el).append('svg').attr('width', width).attr('height', height);
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const parse = d3.timeParse('%Y-%m-%d');
    const xs = this.data.map(d=>d.label);
    // try to parse ISO yyyy-mm or yyyy-mm-dd
    const parseFlex = (s:string) => {
      if (/^\d{4}-\d{2}$/.test(s)) return d3.timeParse('%Y-%m')(s)!;
      if (/^\d{4}-W\d{2}$/.test(s)) { const [y,w] = s.split('-W'); const d = d3.utcParse('%Y-%m-%d')(`${y}-01-01`)!; d.setUTCDate(d.getUTCDate() + (parseInt(w)-1)*7); return d; }
      return d3.utcParse('%Y-%m-%d')(s) || parse(s)!;
    };
    const points = this.data.map(d=>({ x: parseFlex(d.label), y: d.value })).filter(p=>!!p.x) as Array<{x: Date, y: number}>;
    points.sort((a,b)=> a.x.getTime() - b.x.getTime());

    const x = d3.scaleUtc().domain(d3.extent(points, d=>d.x) as [Date, Date]).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, d3.max(points, d=>d.y) || 0]).nice().range([innerH, 0]);

    g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(x));
    g.append('g').call(d3.axisLeft(y));

    const line = d3.line<{x:Date,y:number}>().x(d=>x(d.x)).y(d=>y(d.y));
    g.append('path').datum(points).attr('fill','none').attr('stroke','currentColor').attr('stroke-width',2).attr('d', line);

    const ro = new ResizeObserver(() => this.render());
    ro.observe(el);
    this.cleanup = () => { ro.disconnect(); svg.remove(); };
  }

  ngOnDestroy() { if (this.cleanup) this.cleanup(); }
}
