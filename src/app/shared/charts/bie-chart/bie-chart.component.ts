import { Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  template: `<div #host class="w-full h-full"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieChartComponent implements OnChanges, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;
  @Input() data: Array<{ label: string; value: number }> = [];
  @Input() colorScheme: 'sector-based' | 'modern' | 'pastel' | 'vibrant' | 'corporate' = 'sector-based';
  private cleanup: (() => void) | null = null;

  private sectorColors: { [key: string]: string } = {
    'Government': '#1E40AF',
    'Finance': '#059669',
    'Healthcare': '#DC2626',
    'Energy': '#F59E0B',
    'Education': '#7C3AED',
    'Technology': '#06B6D4',
    'Manufacturing': '#78716C',
    'Retail': '#EC4899',
    'Transportation': '#84CC16',
    'Telecommunications': '#8B5CF6'
  };

  private fallbackColors = [
    '#4F46E5', '#10B981', '#EF4444', '#F97316', 
    '#8B5CF6', '#EC4899', '#84CC16', '#06B6D4',
    '#F59E0B', '#6366F1'
  ];

  ngOnChanges() {
    this.render();
  }

  private render() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }

    const el = this.host.nativeElement;
    el.innerHTML = '';

    const { width } = el.getBoundingClientRect();
    const height = 320;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(el)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const getSectorColor = (label: string, index: number): string => {
      return this.sectorColors[label] || this.fallbackColors[index % this.fallbackColors.length];
    };

    const pie = d3.pie<{ label: string; value: number }>()
      .sort(null)
      .value(d => d.value);

    const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius - 4);

    const paths = g.selectAll('path')
      .data(pie(this.data))
      .join('path')
      .attr('d', arc as any)
      .attr('fill', (d, i) => getSectorColor(d.data.label, i))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0px 3px 6px rgba(0,0,0,0.15))')
      .style('transition', 'all 0.3s ease')
      .style('cursor', 'pointer');

    paths
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.05)')
          .style('filter', 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)')
          .style('filter', 'drop-shadow(0px 3px 6px rgba(0,0,0,0.15))');
      });

    paths.append('title')
      .text(d => `${d.data.label}: ${d.data.value}`);

    const labelArc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    g.selectAll('text')
      .data(pie(this.data))
      .join('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#FFFFFF')
      .style('pointer-events', 'none')
      .each(function(d) {
        const lines = [d.data.label, `${d.data.value}`];
        const text = d3.select(this);
        
        lines.forEach((line, i) => {
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? 0 : '1.1em')
            .style('font-size', i === 0 ? '12px' : '10px')
            .style('font-weight', i === 0 ? '600' : '400')
            .style('fill', '#FFFFFF')
            .text(line);
        });
      });

    const ro = new ResizeObserver(() => this.render());
    ro.observe(el);

    this.cleanup = () => {
      ro.disconnect();
      svg.remove();
    };
  }

  ngOnDestroy() {
    if (this.cleanup) this.cleanup();
  }
}