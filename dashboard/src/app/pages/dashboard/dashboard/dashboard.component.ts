// dashboard.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Tableau de bord', active: true }
  ];
}