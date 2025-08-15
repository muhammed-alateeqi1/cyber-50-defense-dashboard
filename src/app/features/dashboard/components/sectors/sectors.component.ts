import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnifiedStateService } from '../../../../shared/services/unified-state.service';
import { ChartPieComponent } from '../../../../shared/charts2/chart-pie.component';

@Component({
  selector: 'app-sectors',
  standalone: true,
  imports: [CommonModule, ChartPieComponent],
  templateUrl: './sectors.component.html',
  styleUrls: ['./sectors.component.css']
})
export class SectorsComponent implements OnInit {
  pieChartData: Array<{label:string,value:number}> = [];

  constructor(private state: UnifiedStateService) {}

  ngOnInit() {
    this.state.loadOnce();
    this.state.filtered.subscribe(rows => {
      this.pieChartData = this.state.distribution(rows, 'targetSector')
        .filter(d => d.label);
    });
  }
}
