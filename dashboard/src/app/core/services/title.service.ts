// src/app/core/services/title.service.ts
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private baseTitle = 'Prodelec NA';

  constructor(
    private title: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.setupTitleListener();
  }

  private setupTitleListener(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data),
        map(data => data['title'] || this.baseTitle)
      )
      .subscribe((title: string) => {
        this.title.setTitle(title);
      });
  }

  // Méthode pour mettre à jour le titre manuellement depuis un composant
  setCustomTitle(title: string): void {
    const fullTitle = title.includes('|') ? title : `${title} | ${this.baseTitle}`;
    this.title.setTitle(fullTitle);
  }

  // Méthode pour mettre à jour le titre dynamiquement (avec données)
  setDynamicTitle(baseTitle: string, dynamicData?: string): void {
    let fullTitle = baseTitle;
    if (dynamicData) {
      fullTitle = `${baseTitle} - ${dynamicData}`;
    }
    fullTitle = fullTitle.includes('|') ? fullTitle : `${fullTitle} | ${this.baseTitle}`;
    this.title.setTitle(fullTitle);
  }

  // Méthode pour récupérer le titre de base
  getBaseTitle(): string {
    return this.baseTitle;
  }

  // Méthode pour réinitialiser le titre automatique depuis les routes
  resetToRouteTitle(): void {
    this.setupTitleListener();
  }
}