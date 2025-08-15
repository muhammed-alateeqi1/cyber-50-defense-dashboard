import { Component, OnInit } from '@angular/core';
import { BarChartComponent } from '../../../../shared/charts/bar-chart/bar-chart.component';
import { UnifiedStateService } from '../../../../shared/services/unified-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-responses',
  standalone: true,
  imports: [CommonModule, BarChartComponent],
  templateUrl: './responses.component.html'
})
export class ResponsesComponent implements OnInit {
  data: Array<{label:string,value:number}> = [];
  constructor(private state: UnifiedStateService) {}
  ngOnInit() {
    this.state.loadOnce();
    this.state.filtered.subscribe(rows => this.data = this.state.topN(rows, 'response', 15));
  }
}
