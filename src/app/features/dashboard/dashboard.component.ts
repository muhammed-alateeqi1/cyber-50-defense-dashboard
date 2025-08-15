import { Component } from '@angular/core';

import { RouterLink, RouterOutlet } from "@angular/router";
import { FiltersComponent } from '../../shared/components/filters/filters.component';
import { KeyInsightsComponent } from './components/key-insights/key-insights.component';
// import { DarkModeToggleComponent } from "../../shared/components/dark-mode-toggle/dark-mode-toggle.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FiltersComponent, KeyInsightsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
