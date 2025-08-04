// transition-phase.dto.ts
export class TransitionPhaseDto {
  readonly targetPhase: 'devis' | 'order' | 'project';
  readonly targetEntityId?: number; // Pour lier un devis/order/projet existant
}