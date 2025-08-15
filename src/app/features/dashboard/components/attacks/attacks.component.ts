import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnifiedStateService } from '../../../../shared/services/unified-state.service';
import { ChartBarComponent } from '../../../../shared/charts2/chart-bar.component';
import { ChartLineComponent } from '../../../../shared/charts2/chart-line.component';

@Component({
  selector: 'app-attacks',
  standalone: true,
  imports: [CommonModule, ChartBarComponent, ChartLineComponent],
  templateUrl: './attacks.component.html',
  styleUrl: './attacks.component.css'
})
export class AttacksComponent implements OnInit {
  topAttackTypes: Array<{label:string,value:number}> = [];
  timeline: Array<{label:string,value:number}> = [];

  constructor(private state: UnifiedStateService) {}

  ngOnInit() {
    this.state.loadOnce();
    this.state.filtered.subscribe(rows => {
      this.topAttackTypes = this.state.topN(rows, 'attackType', 10);
      this.timeline = this.state.timeSeriesSimple(rows, 'month');
    });
  }
}
