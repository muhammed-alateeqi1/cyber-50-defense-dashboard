import { Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart-bar',
  standalone: true,
  template: `<div #host class="w-full h-full"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartBarComponent implements OnChanges, OnDestroy {
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

    const x = d3.scaleBand().domain(this.data.map(d=>d.label)).range([0, innerW]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(this.data, d=>d.value) || 0]).nice().range([innerH,0]);

    g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(x).tickSizeOuter(0));
    g.append('g').call(d3.axisLeft(y));

    const bars = g.selectAll('rect').data(this.data).enter().append('rect')
      .attr('x', d=>x(d.label) ?? 0)
      .attr('y', d=>y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d=>innerH - y(d.value))
      .attr('fill', 'currentColor')
      .attr('opacity', 0.9);

    const ro = new ResizeObserver(() => this.render());
    ro.observe(el);
    this.cleanup = () => { ro.disconnect(); svg.remove(); };
  }

  ngOnDestroy() { if (this.cleanup) this.cleanup(); }
}
