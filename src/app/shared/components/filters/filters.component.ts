import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnifiedStateService, Filters } from '../../services/unified-state.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="bg-white border rounded-xl p-4 mb-6 shadow-sm">
  <div class="text-xs text-gray-500 mb-2" *ngIf="minDate && maxDate">
    Available range: <span class="font-medium">{{minDate}}</span> → <span class="font-medium">{{maxDate}}</span>
  </div>

  <div class="flex flex-wrap items-end gap-3">
    <div>
      <label class="block text-xs font-medium mb-1">From</label>
      <input class="w-44 border rounded p-2" type="date" [min]="minDate||null" [max]="maxDate||null"
             [(ngModel)]="dateFrom" (change)="apply()">
    </div>
    <div>
      <label class="block text-xs font-medium mb-1">To</label>
      <input class="w-44 border rounded p-2" type="date" [min]="minDate||null" [max]="maxDate||null"
             [(ngModel)]="dateTo" (change)="apply()">
    </div>

    <div>
      <label class="block text-xs font-medium mb-1">Target Country</label>
      <select class="w-52 border rounded p-2" [(ngModel)]="targetCountry" (change)="apply()">
        <option value="">All</option>
        <option *ngFor="let c of options.targetCountries" [value]="c">{{c}}</option>
      </select>
    </div>

    <div>
      <label class="block text-xs font-medium mb-1">Sector</label>
      <select class="w-44 border rounded p-2" [(ngModel)]="targetSector" (change)="apply()">
        <option value="">All</option>
        <option *ngFor="let s of options.targetSectors" [value]="s">{{s}}</option>
      </select>
    </div>

    <div>
      <label class="block text-xs font-medium mb-1">Attack Type</label>
      <select class="w-44 border rounded p-2" [(ngModel)]="attackType" (change)="apply()">
        <option value="">All</option>
        <option *ngFor="let t of options.attackTypes" [value]="t">{{t}}</option>
      </select>
    </div>

    <div>
      <label class="block text-xs font-medium mb-1">Severity</label>
      <select class="w-40 border rounded p-2" [(ngModel)]="severity" (change)="apply()">
        <option value="">All</option>
        <option *ngFor="let s of options.severities" [value]="s">{{s}}</option>
      </select>
    </div>

    <div>
      <label class="block text-xs font-medium mb-1">Initiator Country</label>
      <select class="w-52 border rounded p-2" [(ngModel)]="initiatorCountry" (change)="apply()">
        <option value="">All</option>
        <option *ngFor="let c of options.initiatorCountries" [value]="c">{{c}}</option>
      </select>
    </div>

    <div>
      <label class="block text-xs font-medium mb-1">Initiator Type</label>
      <select class="w-44 border rounded p-2" [(ngModel)]="initiatorType" (change)="apply()">
        <option value="">All</option>
        <option *ngFor="let t of options.initiatorTypes" [value]="t">{{t}}</option>
      </select>
    </div>

    <div>
      <label class="block text-xs font-medium mb-1">Attribution</label>
      <select class="w-44 border rounded p-2" [(ngModel)]="attribution" (change)="apply()">
        <option value="">All</option>
        <option *ngFor="let a of options.attributions" [value]="a">{{a}}</option>
      </select>
    </div>

    <div class="flex-1 min-w-[200px]">
      <label class="block text-xs font-medium mb-1">Search</label>
      <input class="w-full border rounded p-2" placeholder="Type to search..." [(ngModel)]="search" (input)="apply()">
    </div>

    <div class="ml-auto">
      <label class="block text-xs font-medium mb-1">&nbsp;</label>
      <button class="px-3 py-2 border rounded" (click)="reset()">Reset</button>
    </div>
  </div>

  <!-- badges -->
  <div class="mt-3  flex flex-wrap gap-2 text-xs" *ngIf="chips().length">
    <span  *ngFor="let c of chips()"
          class="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
      {{c.label}}: {{c.value}}
      <button class="ml-1" (click)="clear(c.key)">×</button>
    </span>
  </div>
</div>
`})
export class FiltersComponent implements OnInit {
  minDate: string | null = null;
  maxDate: string | null = null;

  dateFrom: string | null = null;
  dateTo: string | null = null;
  targetCountry = '';
  targetSector = '';
  attackType = '';
  severity = '';
  initiatorCountry = '';
  initiatorType = '';
  attribution = '';
  search = '';

  options = {
    attackTypes: [] as string[],
    severities: [] as string[],
    targetCountries: [] as string[],
    targetSectors: [] as string[],
    initiatorCountries: [] as string[],
    initiatorTypes: [] as string[],
    responses: [] as string[],
    attributions: [] as string[],
  };

  constructor(private state: UnifiedStateService) {}

  ngOnInit() {
    this.state.loadOnce();
    this.state.bounds.subscribe(b => {
      this.minDate = b.minDate;
      this.maxDate = b.maxDate;
      if (!this.dateFrom && b.minDate) this.dateFrom = b.minDate;
      if (!this.dateTo && b.maxDate) this.dateTo = b.maxDate;
      this.apply();
    });
    this.state.options.subscribe(opts => { this.options = opts; });
  }

  apply() {
    if (this.minDate && this.dateFrom && this.dateFrom < this.minDate) this.dateFrom = this.minDate;
    if (this.maxDate && this.dateTo && this.dateTo > this.maxDate) this.dateTo = this.maxDate;

    const patch: Partial<Filters> = {
      dateFrom: this.dateFrom, dateTo: this.dateTo,
      targetCountry: this.targetCountry || null,
      targetSector: this.targetSector || null,
      attackType: this.attackType || null,
      severity: this.severity || null,
      initiatorCountry: this.initiatorCountry || null,
      initiatorType: this.initiatorType || null,
      attribution: this.attribution || null,
      search: this.search || null,
    };
    this.state.setFilters(patch);
  }

  reset() {
    this.targetCountry = this.targetSector = this.attackType = this.severity = '';
    this.initiatorCountry = this.initiatorType = this.attribution = '';
    this.search = '';
    this.apply();
  }

  chips() {
    const out: Array<{key: keyof Filters, label: string, value: string}> = [];
    const push = (k: keyof Filters, label: string, v?: string|null) => { if (v) out.push({key: k, label, value: v}); };
    push('targetCountry','Country', this.targetCountry);
    push('targetSector','Sector', this.targetSector);
    push('attackType','Attack', this.attackType);
    push('severity','Severity', this.severity);
    push('initiatorCountry','Initiator Country', this.initiatorCountry);
    push('initiatorType','Initiator Type', this.initiatorType);
    push('attribution','Attribution', this.attribution);
    if (this.search) out.push({key:'search', label:'Search', value:this.search});
    return out;
  }
  clear(k: keyof Filters) {
    if (k==='targetCountry') this.targetCountry='';
    if (k==='targetSector') this.targetSector='';
    if (k==='attackType') this.attackType='';
    if (k==='severity') this.severity='';
    if (k==='initiatorCountry') this.initiatorCountry='';
    if (k==='initiatorType') this.initiatorType='';
    if (k==='attribution') this.attribution='';
    if (k==='search') this.search='';
    this.apply();
  }
}
