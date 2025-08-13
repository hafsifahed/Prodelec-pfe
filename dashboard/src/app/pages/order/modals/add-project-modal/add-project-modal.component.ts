import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, ValidationErrors, AbstractControl, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ProjectDto } from 'src/app/core/models/projectfo/project-dto';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { User } from 'src/app/core/models/auth.models';

@Component({
  selector: 'app-add-project-modal',
  templateUrl: './add-project-modal.component.html',
  styleUrls: ['./add-project-modal.component.scss']
})
export class AddProjectModalComponent implements OnInit {
  @Input() idorder!: number;
  @Input() listr: any[] = [];
  @Input() user!: User;
  @Output() modalClosed = new EventEmitter<void>();

  projectForm!: UntypedFormGroup;
  showSections = {
    conception: false,
    methode: false,
    production: false,
    controle: false,
    livraison: false
  };

  constructor(
    private fb: UntypedFormBuilder,
    private projectservice: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      refc: ['', [Validators.required]],
      refp: ['', [Validators.required]],
      dlp: ['', [Validators.required]],

      conceptionChecked: [false],
      methodeChecked: [false],
      productionChecked: [false],
      controleChecked: [false],
      livraisonChecked: [false],

      drc: [],  // durée conception
      rc: [''], // pilote conception
      dc: [''], // début conception
      fc: [''], // fin conception
      cdc: [''], // commentaire conception (optionnel)

      drm: [],
      rm: [''],
      dm: [''],
      fm: [''],
      cdm: [''],

      drp: [],
      rp: [''],
      dp: [''],
      fp: [''],
      cdp: [''],

      drcf: [],
      rcf: [''],
      dcf: [''],
      fcf: [''],
      cdcf: [''],

      drl: [],
      rl: [''],
      dl: [''],
      fl: [''],
      cdl: [''],

      qte: [0, [Validators.required]]
    }, { validators: this.phasesValidator });
  }

  toggleSection(section: string) {
  this.showSections[section] = !this.showSections[section];
  if (!this.showSections[section]) {
    // Si tu souhaites vider aussi les champs de cette section quand tu la caches
    switch (section) {
      case 'conception':
        this.projectForm.patchValue({ drc: null, rc: '', dc: '', fc: '', cdc: '' });
        break;
      case 'methode':
        this.projectForm.patchValue({ drm: null, rm: '', dm: '', fm: '', cdm: '' });
        break;
      case 'production':
        this.projectForm.patchValue({ drp: null, rp: '', dp: '', fp: '', cdp: '' });
        break;
      case 'controle':
        this.projectForm.patchValue({ drcf: null, rcf: '', dcf: '', fcf: '', cdcf: '' });
        break;
      case 'livraison':
        this.projectForm.patchValue({ drl: null, rl: '', dl: '', fl: '', cdl: '' });
        break;
    }
  }
}


  /** Validateur global pour la logique spécifique aux phases */
  phasesValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {

    const dlpRaw = group.get('dlp')?.value;
    const dlp = dlpRaw ? new Date(dlpRaw) : null;
    if (!dlp) return null;

    const phases = [
      { prefix: 'conception', checkedKey: 'conceptionChecked', durationKey: 'drc', pilotKey: 'rc', startKey: 'dc', endKey: 'fc' },
      { prefix: 'methode', checkedKey: 'methodeChecked', durationKey: 'drm', pilotKey: 'rm', startKey: 'dm', endKey: 'fm' },
      { prefix: 'production', checkedKey: 'productionChecked', durationKey: 'drp', pilotKey: 'rp', startKey: 'dp', endKey: 'fp' },
      { prefix: 'controle', checkedKey: 'controleChecked', durationKey: 'drcf', pilotKey: 'rcf', startKey: 'dcf', endKey: 'fcf' },
      { prefix: 'livraison', checkedKey: 'livraisonChecked', durationKey: 'drl', pilotKey: 'rl', startKey: 'dl', endKey: 'fl' }
    ];

    for (const phase of phases) {
      const checked = group.get(phase.checkedKey)?.value;

      const durationRaw = group.get(phase.durationKey)?.value;
      const pilotRaw = group.get(phase.pilotKey)?.value;
      const startRaw = group.get(phase.startKey)?.value;
      const endRaw = group.get(phase.endKey)?.value;

      // Durée 0 n'est pas champ rempli (condition modifiée ici)
      const durationFilled = durationRaw !== null && durationRaw !== undefined && durationRaw !== '' && Number(durationRaw) !== 0;
      const pilotFilled = pilotRaw !== null && pilotRaw !== undefined && pilotRaw.toString().trim() !== '';
      const startFilled = startRaw !== null && startRaw !== undefined && startRaw !== '';
      const endFilled = endRaw !== null && endRaw !== undefined && endRaw !== '';

      const anyFieldFilled = durationFilled || pilotFilled || startFilled || endFilled;

      if (checked) {
        // Si phase cochée, et au moins un champ est rempli alors tous obligatoires
        if (anyFieldFilled) {
          if (!(durationFilled && pilotFilled && startFilled && endFilled)) {
            return { [`${phase.prefix}Incomplete`]: `Tous les champs (durée, pilote, date début, date fin) doivent être remplis pour la phase ${phase.prefix} si un champ est rempli.` };
          }
        }
        // Si cochée mais aucune saisie => pas d'obligation
      } else {
        // Si phase non cochée mais un champ rempli => tous obligatoires
        if (anyFieldFilled) {
          if (!(durationFilled && pilotFilled && startFilled && endFilled)) {
            return { [`${phase.prefix}Incomplete`]: `Phase ${phase.prefix} non cochée : si un champ est rempli, tous les champs (durée, pilote, date début, date fin) doivent être remplis.` };
          }
        }
      }

      // Vérification date début <= date fin
      if (startFilled && endFilled) {
        const startDate = new Date(startRaw);
        const endDate = new Date(endRaw);
        if (startDate > endDate) {
          return { [`${phase.prefix}DateInvalid`]: `La date de début de la phase ${phase.prefix} ne peut pas être après la date de fin.` };
        }
        // Vérifier que les dates ne dépassent pas la date livraison prévue
        if (dlp && (startDate > dlp || endDate > dlp)) {
          return { [`${phase.prefix}DateAfterDelivery`]: `Les dates de la phase ${phase.prefix} ne peuvent pas être après la date de livraison prévue.` };
        }
      }
    }

    return null; // validation OK
  }

  addproject() {
    if (this.projectForm.invalid) {
      const errors = this.projectForm.errors;
      let msg = 'Veuillez vérifier les champs.';

      if (errors) {
        msg = Object.values(errors).join('\n');
      }

      Swal.fire({
        icon: 'error',
        title: 'Erreur de validation',
        text: msg,
      });
      return;
    }

    const f = this.projectForm.value;

    // Convertir durées en nombres, éviter chaînes vides ou undef
    const drc = Number(f.drc) || 0;
    const drm = Number(f.drm) || 0;
    const drp = Number(f.drp) || 0;
    const drcf = Number(f.drcf) || 0;
    const drl = Number(f.drl) || 0;

    const project: ProjectDto = {
      refClient: f.refc,
      refProdelec: f.refp,
      qte: f.qte,
      dlp: f.dlp,
      duree: drc + drm + drp + drcf + drl,
      conceptionComment: f.cdc,
      conceptionDuration: drc,
      methodeComment: f.cdm,
      methodeDuration: drm,
      productionComment: f.cdp,
      productionDuration: drp,
      finalControlComment: f.cdcf,
      finalControlDuration: drcf,
      deliveryComment: f.cdl,
      deliveryDuration: drl,
      startConception: f.dc ? new Date(formatDate(f.dc, 'yyyy-MM-dd', 'en-US')) : null,
      endConception: f.fc ? new Date(formatDate(f.fc, 'yyyy-MM-dd', 'en-US')) : null,
      startMethode: f.dm ? new Date(formatDate(f.dm, 'yyyy-MM-dd', 'en-US')) : null,
      endMethode: f.fm ? new Date(formatDate(f.fm, 'yyyy-MM-dd', 'en-US')) : null,
      startProduction: f.dp ? new Date(formatDate(f.dp, 'yyyy-MM-dd', 'en-US')) : null,
      endProduction: f.fp ? new Date(formatDate(f.fp, 'yyyy-MM-dd', 'en-US')) : null,
      startFc: f.dcf ? new Date(formatDate(f.dcf, 'yyyy-MM-dd', 'en-US')) : null,
      endFc: f.fcf ? new Date(formatDate(f.fcf, 'yyyy-MM-dd', 'en-US')) : null,
      startDelivery: f.dl ? new Date(formatDate(f.dl, 'yyyy-MM-dd', 'en-US')) : null,
      endDelivery: f.fl ? new Date(formatDate(f.fl, 'yyyy-MM-dd', 'en-US')) : null,
      conceptionExist: f.conceptionChecked,
      methodeExist: f.methodeChecked,
      productionExist: f.productionChecked,
      finalControlExist: f.controleChecked,
      deliveryExist: f.livraisonChecked,
    };

    const respcons = (f.rc || '').trim() || undefined;
    const resmeth = (f.rm || '').trim() || undefined;
    const resprod = (f.rp || '').trim() || undefined;
    const rescf = (f.rcf || '').trim() || undefined;
    const resliv = (f.rl || '').trim() || undefined;

    this.projectservice.createProject(project, this.idorder, respcons, resmeth, resprod, rescf, resliv).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Projet ajouté',
          showConfirmButton: false,
          timer: 1500,
        });
        this.modalClosed.emit();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.error?.message || 'Une erreur est survenue lors de la création du projet.',
          footer: 'Veuillez réessayer'
        });
      }
    });
  }

  closeModal() {
  this.projectForm.reset({
    refc: '',
    refp: '',
    dlp: '',
    conceptionChecked: false,
    methodeChecked: false,
    productionChecked: false,
    controleChecked: false,
    livraisonChecked: false,
    drc: null,
    rc: '',
    dc: '',
    fc: '',
    cdc: '',

    drm: null,
    rm: '',
    dm: '',
    fm: '',
    cdm: '',

    drp: null,
    rp: '',
    dp: '',
    fp: '',
    cdp: '',

    drcf: null,
    rcf: '',
    dcf: '',
    fcf: '',
    cdcf: '',

    drl: null,
    rl: '',
    dl: '',
    fl: '',
    cdl: '',

    qte: 0,
  });
  
  this.modalClosed.emit();
}

}
