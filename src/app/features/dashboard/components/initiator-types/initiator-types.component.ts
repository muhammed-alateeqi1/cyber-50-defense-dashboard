import { Component, OnInit } from '@angular/core';
import { BarChartComponent } from '../../../../shared/charts/bar-chart/bar-chart.component';
import { UnifiedStateService } from '../../../../shared/services/unified-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-initiator-types',
  standalone: true,
  imports: [CommonModule, BarChartComponent],
  templateUrl: './initiator-types.component.html'
})
export class InitiatorTypesComponent implements OnInit {
  data: Array<{label:string,value:number}> = [];
  constructor(private state: UnifiedStateService) {}
  ngOnInit() {
    this.state.loadOnce();
    this.state.filtered.subscribe(rows => this.data = this.state.topN(rows, 'initiatorType', 15));
  }
}
