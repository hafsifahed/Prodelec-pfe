import { Component, Input } from '@angular/core';
import { Project } from 'src/app/core/models/projectfo/project';

@Component({
  selector: 'app-project-phase-details-modal',
  templateUrl: './project-phase-details-modal.component.html',
  styleUrls: ['./project-phase-details-modal.component.scss']
})
export class ProjectPhaseDetailsModalComponent {
  @Input() project: Project | null = null;
  @Input() phase: 'conception' | 'methode' | 'production' | 'controle' | 'livraison' = 'conception';

  get phaseTitle() {
    switch (this.phase) {
      case 'conception': return 'Conception';
      case 'methode': return 'Méthode';
      case 'production': return 'Production';
      case 'controle': return 'Contrôle final';
      case 'livraison': return 'Livraison';
      default: return '';
    }
  }

  get phaseData() {
    if (!this.project) return null;
    
    switch (this.phase) {
      case 'conception':
        return {
          comment: this.project.conceptionComment,
          duration: this.project.conceptionDuration,
          responsible: this.project.conceptionResponsible?.username,
          start: this.project.startConception,
          end: this.project.endConception,
          realEnd: this.project.realendConception
        };
      case 'methode':
        return {
          comment: this.project.methodeComment,
          duration: this.project.methodeDuration,
          responsible: this.project.methodeResponsible?.username,
          start: this.project.startMethode,
          end: this.project.endMethode,
          realEnd: this.project.realendMethode
        };
      case 'production':
        return {
          comment: this.project.productionComment,
          duration: this.project.productionDuration,
          responsible: this.project.productionResponsible?.username,
          start: this.project.startProduction,
          end: this.project.endProduction,
          realEnd: this.project.realendProduction
        };
      case 'controle':
        return {
          comment: this.project.finalControlComment,
          duration: this.project.finalControlDuration,
          responsible: this.project.finalControlResponsible?.username,
          start: this.project.startFc,
          end: this.project.endFc,
          realEnd: this.project.realendFc
        };
      case 'livraison':
        return {
          comment: this.project.deliveryComment,
          duration: this.project.deliveryDuration,
          responsible: this.project.deliveryResponsible?.username,
          start: this.project.startDelivery,
          end: this.project.endDelivery,
          realEnd: this.project.realendDelivery
        };
      default:
        return null;
    }
  }
}