// src/app/shared/charts/bar-chart/bar-chart.component.ts
import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `<div #host class="w-full h-full"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarChartComponent implements OnChanges, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;
  @Input() data: Array<{ label: string; value: number }> = [];
  @Input() height = 320;
  @Input() yTicks = 20;

  private cleanup: (() => void) | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['height'] || changes['yTicks']) this.render();
  }

  private render() {
    // تحقق من وجود البيانات قبل الرسم
    if (!this.data || !Array.isArray(this.data) || this.data.length === 0) {
      return;
    }

    if (this.cleanup) { this.cleanup(); this.cleanup = null; }

    const el = this.host.nativeElement;
    const { width } = el.getBoundingClientRect();
    const height = this.height;

    // تكبير المساحة الجانبية للتسميات الطويلة
    const margin = { top: 20, right: 60, bottom: 20, left: 150 };
    const w = Math.max(0, width - margin.left - margin.right);
    const h = Math.max(0, height - margin.top - margin.bottom);

    const svg = d3.select(el).append('svg').attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // المحاور - X للقيم، Y للتسميات
    const x = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.value) || 0])
      .nice()
      .range([0, w]);

    const y = d3.scaleBand()
      .domain(this.data.map(d => d.label))
      .range([0, h])
      .padding(0.15);

    // إنشاء gradient للألوان المتدرجة
    const defs = svg.append('defs');
    
    const gradient = defs.append('linearGradient')
      .attr('id', 'barGradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('style', 'stop-color:#1e40af;stop-opacity:1'); // أزرق غامق

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('style', 'stop-color:#3b82f6;stop-opacity:1'); // أزرق فاتح

    // رسم المحور السفلي للقيم (مخفي أو بسيط)
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(0))
      .select('.domain')
      .remove(); // إخفاء الخط الأساسي

    // تنسيق نصوص المحور السفلي
    g.selectAll('.tick text')
      .style('fill', '#9ca3af')
      .style('font-size', '11px');

    // المحور الجانبي للتسميات
    g.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain')
      .remove(); // إخفاء الخط الأساسي

    // تنسيق التسميات
    g.selectAll('.tick text')
      .style('font-size', '13px')
      .style('fill', '#374151')
      .style('font-weight', '500');

    // رسم الـ Bars الأفقية
    const bars = g.selectAll('rect.bar')
      .data(this.data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d.label)!)
      .attr('width', d => x(d.value))
      .attr('height', y.bandwidth())
      .attr('fill', 'url(#barGradient)') // استخدام الـ gradient
      .attr('rx', 6)
      .attr('ry', 6);

    // إضافة shadow effect
    const filter = defs.append('filter')
      .attr('id', 'shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('stdDeviation', 3)
      .attr('flood-color', 'rgba(0,0,0,0.1)');

    bars.attr('filter', 'url(#shadow)');

    // إضافة النصوص (القيم) على الـ bars
    g.selectAll('text.value')
      .data(this.data)
      .join('text')
      .attr('class', 'value')
      .attr('x', d => x(d.value) + 8)
      .attr('y', d => y(d.label)! + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .style('fill', '#1f2937')
      .text(d => d.value);

    // إضافة Tooltip
    bars.append('title')
      .text(d => `${d.label}: ${d.value}`);

    // تأثيرات التفاعل المحسنة
    bars.on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('transform', 'scale(1.02)');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('transform', 'scale(1)');
      });

    const ro = new ResizeObserver(() => this.render());
    ro.observe(el);
    this.cleanup = () => { ro.disconnect(); svg.remove(); };
  }

  ngOnDestroy() { if (this.cleanup) this.cleanup(); }
}