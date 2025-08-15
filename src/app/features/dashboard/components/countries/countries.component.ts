import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnifiedStateService } from '../../../../shared/services/unified-state.service';
import { ChartBarComponent } from '../../../../shared/charts2/chart-bar.component';

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [CommonModule, ChartBarComponent],
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.css'
})
export class CountriesComponent implements OnInit {
  topCountries: Array<{label:string,value:number}> = [];
  constructor(private state: UnifiedStateService) {}
  ngOnInit(): void {
    this.state.loadOnce();
    this.state.filtered.subscribe(rows => this.topCountries = this.state.topN(rows, 'targetCountry', 15));
  }
}
