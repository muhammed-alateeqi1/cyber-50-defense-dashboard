import { Routes } from '@angular/router';
import { LandingComponent } from './layout/pages/landing/landing.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AttacksComponent } from './features/dashboard/components/attacks/attacks.component';
import { AttributionsComponent } from './features/dashboard/components/attributions/attributions.component';
import { CountriesComponent } from './features/dashboard/components/countries/countries.component';
import { InitiatorCountriesComponent } from './features/dashboard/components/initiator-countries/initiator-countries.component';
import { InitiatorTypesComponent } from './features/dashboard/components/initiator-types/initiator-types.component';
import { ResponsesComponent } from './features/dashboard/components/responses/responses.component';
import { KeyInsightsComponent } from './features/dashboard/components/key-insights/key-insights.component';
import { SectorsComponent } from './features/dashboard/components/sectors/sectors.component';
import { AllRecordsComponent } from './features/dashboard/components/all-records/all-records.component';

export const routes: Routes = [
    { path: '', redirectTo: 'landing', pathMatch: 'full' },
    { path: 'landing', component: LandingComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
            { path: 'all-records', component: AllRecordsComponent },
            { path: '', redirectTo: 'attacks', pathMatch: 'full' },
            { path: 'attacks', component: AttacksComponent },
            { path: 'attributions', component: AttributionsComponent },
            { path: 'countries', component: CountriesComponent },
            { path: 'initiator-countries', component: InitiatorCountriesComponent },
            { path: 'initiator-types', component: InitiatorTypesComponent },
            { path: 'key-insights', component: KeyInsightsComponent },
            { path: 'responses', component: ResponsesComponent },
            { path: 'sectors', component: SectorsComponent }
        ]
    },
];
