import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { UnifiedStateService, Incident } from '../../../../shared/services/unified-state.service';

type Pt = { lon: number; lat: number };
type AttackFlow = {
  from: string;
  to: string;
  count: number;
  severity: string;
  attackType: string;
  totalRecords: number;
  fromCoords: Pt;
  toCoords: Pt;
};

@Component({
  selector: 'app-initiator-countries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './initiator-countries.component.html',
  styleUrl: './initiator-countries.component.css'
})
export class InitiatorCountriesComponent implements OnInit, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  animated = true;
  showGrid = true;           
  topN = 10;

  private svg!: d3.Selection<SVGSVGElement, unknown, any, any>;
  private animationFrameId?: number;
  private cleanup: (() => void) | null = null;


  private attackColors: Record<string, string> = {
    'Malware': '#ef4444',
    'Ransomware': '#ec4899',
    'Social Engineering': '#f97316',
    'SQL Injection': '#06b6d4',
    'Business Email Compromise': '#eab308',
    'DDoS': '#8b5cf6',
    'Phishing': '#f59e0b'
  };


  private severityColors: Record<string, string> = {
    'Critical': '#dc2626',
    'High': '#ea580c',
    'Medium': '#ca8a04',
    'Low': '#65a30d'
  };

  private countryCoords: Record<string, Pt> = {
    'United States': { lon: -95.7129, lat: 37.0902 },
    'USA': { lon: -95.7129, lat: 37.0902 },
    'Russia': { lon: 105.3188, lat: 61.524 },
    'China': { lon: 104.1954, lat: 35.8617 },
    'North Korea': { lon: 127.5101, lat: 40.3399 },
    'India': { lon: 78.9629, lat: 20.5937 },
    'France': { lon: 2.2137, lat: 46.2276 },
    'United Kingdom': { lon: -3.436, lat: 55.378 },
    'Germany': { lon: 10.4515, lat: 51.1657 },
    'Japan': { lon: 138.2529, lat: 36.2048 },
    'South Korea': { lon: 127.7669, lat: 35.9078 },
    'Brazil': { lon: -51.9253, lat: -14.235 },
    'Australia': { lon: 133.7751, lat: -25.2744 },
    'Canada': { lon: -106.3468, lat: 56.1304 },
    'Iran': { lon: 53.688, lat: 32.4279 },
    'Israel': { lon: 34.8516, lat: 31.0461 },
    'Turkey': { lon: 35.2433, lat: 38.9637 },
    'Ukraine': { lon: 31.1656, lat: 48.3794 },
    'Italy': { lon: 12.5674, lat: 41.8719 },
    'Spain': { lon: -3.7492, lat: 40.4637 },
    'Netherlands': { lon: 5.2913, lat: 52.1326 },
    'Poland': { lon: 19.1451, lat: 51.9194 },
    'Mexico': { lon: -102.5528, lat: 23.6345 },
    'Pakistan': { lon: 69.3451, lat: 30.3753 },
    'Afghanistan': { lon: 67.709953, lat: 33.93911 }
  };

  constructor(private state: UnifiedStateService) {}

  ngOnInit(): void {
    this.state.loadOnce();
    this.state.filtered.subscribe((rows) => this.render(rows));
  }

  ngOnDestroy(): void {
    if (this.cleanup) this.cleanup();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  toggleAnimation(): void { this.animated = !this.animated; }
  toggleGrid(): void {
    this.showGrid = !this.showGrid;

    this.state.filtered.subscribe((rows) => this.render(rows));
  }

  
  private render(rows: Incident[]): void {
    if (this.cleanup) this.cleanup();

    const el = this.host.nativeElement;
    const width = el.clientWidth || 980;
    const height = 540;

    d3.select(el).selectAll('*').remove();

    
    this.svg = d3.select(el)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    
    const projection = d3.geoNaturalEarth1()
      .fitExtent([[18, 18], [width - 18, height - 18]], { type: 'Sphere' } as any);
    const geoPath = d3.geoPath(projection as any);


    this.svg.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', width).attr('height', height)
      .attr('fill', '#8A8A8A'); 

    this.svg.append('path')
      .attr('d', geoPath({ type: 'Sphere' } as any)!)
      .attr('fill', '#0b1220'); 

    if (this.showGrid) {
      const gr = d3.geoGraticule10();
      this.svg.append('path')
        .attr('d', geoPath(gr)!)
        .attr('fill', 'none')
        .attr('stroke', '#1f2a44')
        .attr('stroke-opacity', 0.35)
        .attr('stroke-width', 0.6);
    }


    const flows = this.processIncidents(rows);
    if (!flows.length) {
      this.svg.append('text')
        .attr('x', width / 2).attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', 16)
        .text('No attack data available for current filters');
      this.cleanup = () => this.svg.remove();
      return;
    }

    
    const defs = this.svg.append('defs');
    const glow = defs.append('filter').attr('id', 'flow-glow');
    glow.append('feGaussianBlur').attr('stdDeviation', 2).attr('result', 'blur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    
    this.drawCountryNodes(flows, projection);

    
    this.drawAttackFlows(flows, projection);

    
    if (this.animated) this.startAnimation();

    
    const ro = new ResizeObserver(() => {
      this.state.filtered.subscribe((current) => this.render(current));
    });
    ro.observe(el);

    this.cleanup = () => {
      ro.disconnect();
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.svg.remove();
    };
  }

  
  private processIncidents(rows: Incident[]): AttackFlow[] {
    const flowMap = new Map<string, AttackFlow>();
    rows.forEach(inc => {
      const from = this.normalizeCountry(inc.initiatorCountry);
      const to   = this.normalizeCountry(inc.targetCountry);
      if (!from || !to || from === to) return;
      const A = this.countryCoords[from], B = this.countryCoords[to];
      if (!A || !B) return;

      const key = `${from}→${to}`;
      const prev = flowMap.get(key);
      if (prev) {
        prev.count += 1;
        prev.totalRecords += inc.affectedRecords || 0;
        
        if (this.sevLevel(inc.severity) > this.sevLevel(prev.severity)) prev.severity = inc.severity;
      } else {
        flowMap.set(key, {
          from, to,
          count: 1,
          severity: inc.severity,
          attackType: inc.attackType,
          totalRecords: inc.affectedRecords || 0,
          fromCoords: A, toCoords: B
        });
      }
    });

    return Array.from(flowMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, this.topN);
  }

  
  private drawCountryNodes(flows: AttackFlow[], projection: d3.GeoProjection): void {
    const group = this.svg.append('g');
    const active = new Set<string>();
    flows.forEach(f => { active.add(f.from); active.add(f.to); });

    active.forEach(name => {
      const pt = this.countryCoords[name];
      const p = projection([pt.lon, pt.lat]);
      if (!p) return;
      const [x, y] = p;

      group.append('circle')
        .attr('cx', x).attr('cy', y)
        .attr('r', 8).attr('fill', 'none')
        .attr('stroke', '#06b6d4').attr('stroke-width', 2)
        .attr('opacity', 0.55).style('filter', 'url(#flow-glow)');

      group.append('circle')
        .attr('cx', x).attr('cy', y)
        .attr('r', 3).attr('fill', '#06b6d4')
        .style('filter', 'url(#flow-glow)');

      group.append('text')
        .attr('x', x).attr('y', y - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#86efac') 
        .attr('font-size', 9)
        .text(name)
        .style('pointer-events', 'none');
    });
  }

  private drawAttackFlows(flows: AttackFlow[], projection: d3.GeoProjection): void {
    const g = this.svg.append('g');

    const maxCount = d3.max(flows, d => d.count) || 1;
    const strokeW = d3.scaleLinear().domain([1, maxCount]).range([1, 4]);

    const linePath = (a: Pt, b: Pt) => {
      
      const interp = (d3 as any).geoInterpolate([a.lon, a.lat], [b.lon, b.lat]) as (t: number) => [number, number];
      const steps = 48;
      let d = '';
      for (let i = 0; i <= steps; i++) {
        const p = projection(interp(i / steps));
        if (!p) continue;
        const [x, y] = p;
        d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
      }
      return d;
    };

    flows.forEach((f, i) => {
      const color = this.attackColors[f.attackType] || '#ef4444';
      const dStr = linePath(f.fromCoords, f.toCoords);

      
      g.append('path')
        .attr('d', dStr)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', strokeW(f.count))
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0.35);

      
      g.append('path')
        .attr('d', dStr)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', strokeW(f.count) * 1.5)
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0)
        .attr('data-flow-index', i)
        .style('filter', 'url(#flow-glow)')
        .style('cursor', 'pointer')
        .on('mouseover', (evt) => this.showTooltip(evt, f))
        .on('mouseout', () => this.hideTooltip())
        .on('mousemove', (evt) => this.moveTooltip(evt));
    });
  }

  private startAnimation(): void {
    const animate = () => {
      if (!this.animated) return;

      const t = Date.now();
      this.svg.selectAll<SVGPathElement, unknown>('path[data-flow-index]')
        .each(function(_, i) {
          const path = d3.select(this);
          const el = this as SVGPathElement;
          const L = el.getTotalLength();

          const duration = 2800 + i * 180;
          const progress = ((t + i * 450) % duration) / duration;

          if (progress < 0.7) {
            const dash = Math.max(14, L * 0.12);
            const offset = -progress * L;
            path
              .attr('stroke-dasharray', `${dash} ${Math.max(1, L - dash)}`)
              .attr('stroke-dashoffset', offset)
              .attr('opacity', 0.9);
          } else {
            path.attr('opacity', 0);
          }
        });

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  
  private showTooltip(event: MouseEvent, f: AttackFlow): void {
    this.hideTooltip();
    const g = this.svg.append('g').attr('class', 'tooltip')
      .attr('transform', `translate(${event.offsetX + 10}, ${event.offsetY - 10})`);

    const rect = g.append('rect')
      .attr('fill', 'rgba(15,23,42,0.95)')
      .attr('stroke', '#06b6d4').attr('stroke-width', 1)
      .attr('rx', 4).attr('ry', 4);

    const text = g.append('text')
      .attr('fill', '#e2e8f0').attr('font-size', 12)
      .attr('x', 8).attr('y', 16);

    const lines = [
      `${f.from} → ${f.to}`,
      `Type: ${f.attackType}`,
      `Severity: ${f.severity}`,
      `Attacks: ${f.count}`,
      `Records: ${f.totalRecords.toLocaleString()}`
    ];
    lines.forEach((ln, idx) => {
      text.append('tspan').attr('x', 8).attr('dy', idx === 0 ? 0 : 14).text(ln);
    });

    const bb = (text.node() as SVGTextElement).getBBox();
    rect.attr('width', bb.width + 16).attr('height', bb.height + 16);
  }
  private hideTooltip(): void { this.svg.selectAll('.tooltip').remove(); }
  private moveTooltip(event: MouseEvent): void {
    this.svg.selectAll<SVGGElement, unknown>('.tooltip')
      .attr('transform', `translate(${event.offsetX + 10}, ${event.offsetY - 10})`);
  }

  
  private normalizeCountry(s?: string | null): string {
    const normalized = (s ?? '').trim().replace(/\s+/g, ' ').replace(/[.,]/g, '')
      .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const aliases: Record<string, string> = {
      'Usa': 'USA', 'United States Of America': 'USA', 'Us': 'USA',
      'Uk': 'United Kingdom', 'Uae': 'United Arab Emirates',
      'Russian Federation': 'Russia',
      'Korea South': 'South Korea', 'Korea Republic Of': 'South Korea',
      'Korea North': 'North Korea'
    };
    return aliases[normalized] || normalized;
  }
  private sevLevel(s: string): number {
    const L: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return L[s] || 1;
  }
}
