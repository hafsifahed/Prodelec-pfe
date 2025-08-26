import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, ValidationErrors, AbstractControl, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ProjectDto } from 'src/app/core/models/projectfo/project-dto';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { User } from 'src/app/core/models/auth.models';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { frLocale } from 'ngx-bootstrap/locale';

// Définir la locale française
defineLocale('fr', frLocale);

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
  @ViewChild('dateRangeModal') dateRangeModal!: TemplateRef<any>;

  projectForm!: UntypedFormGroup;
  showSections = {
    conception: false,
    methode: false,
    production: false,
    controle: false,
    livraison: false
  };

  // Propriétés pour le date range picker
  bsConfig: Partial<BsDaterangepickerConfig>;
  bsValue: Date[] = [];
  dateRangeModalRef?: BsModalRef;
  activeDateField: string = '';

  constructor(
    private fb: UntypedFormBuilder,
    private projectservice: ProjectService,
    private router: Router,
    private modalService: BsModalService,
    private localeService: BsLocaleService
  ) {
    this.localeService.use('fr');
  }

  ngOnInit(): void {
    // Configuration du datepicker
    this.bsConfig = Object.assign({}, {
      containerClass: 'theme-dark-blue',
      rangeInputFormat: 'DD/MM/YYYY',
      showWeekNumbers: false,
      isAnimated: true,
      dateInputFormat: 'DD/MM/YYYY'
    });

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

  // Ouvrir le modal de sélection de dates
  openDateRangeModal(field: string) {
    this.activeDateField = field;
    
    // Pré-remplir avec les valeurs existantes si disponibles
    if (field === 'conception') {
      const dc = this.projectForm.get('dc')?.value;
      const fc = this.projectForm.get('fc')?.value;
      if (dc && fc) {
        this.bsValue = [new Date(dc), new Date(fc)];
      }
    } else if (field === 'methode') {
      const dm = this.projectForm.get('dm')?.value;
      const fm = this.projectForm.get('fm')?.value;
      if (dm && fm) {
        this.bsValue = [new Date(dm), new Date(fm)];
      }
    } else if (field === 'production') {
      const dp = this.projectForm.get('dp')?.value;
      const fp = this.projectForm.get('fp')?.value;
      if (dp && fp) {
        this.bsValue = [new Date(dp), new Date(fp)];
      }
    } else if (field === 'controle') {
      const dcf = this.projectForm.get('dcf')?.value;
      const fcf = this.projectForm.get('fcf')?.value;
      if (dcf && fcf) {
        this.bsValue = [new Date(dcf), new Date(fcf)];
      }
    } else if (field === 'livraison') {
      const dl = this.projectForm.get('dl')?.value;
      const fl = this.projectForm.get('fl')?.value;
      if (dl && fl) {
        this.bsValue = [new Date(dl), new Date(fl)];
      }
    }
    
    this.dateRangeModalRef = this.modalService.show(this.dateRangeModal, {
      class: 'modal-dialog-centered modal-sm'
    });
  }

  // Appliquer la sélection de dates
  applyDateSelection() {
    if (this.bsValue && this.bsValue.length === 2) {
      const startDate = this.bsValue[0];
      const endDate = this.bsValue[1];
      
      if (this.activeDateField === 'conception') {
        this.projectForm.get('dc')?.setValue(startDate);
        this.projectForm.get('fc')?.setValue(endDate);
      } else if (this.activeDateField === 'methode') {
        this.projectForm.get('dm')?.setValue(startDate);
        this.projectForm.get('fm')?.setValue(endDate);
      } else if (this.activeDateField === 'production') {
        this.projectForm.get('dp')?.setValue(startDate);
        this.projectForm.get('fp')?.setValue(endDate);
      } else if (this.activeDateField === 'controle') {
        this.projectForm.get('dcf')?.setValue(startDate);
        this.projectForm.get('fcf')?.setValue(endDate);
      } else if (this.activeDateField === 'livraison') {
        this.projectForm.get('dl')?.setValue(startDate);
        this.projectForm.get('fl')?.setValue(endDate);
      }
    }
    
    this.dateRangeModalRef?.hide();
  }

  // Réinitialiser la sélection de dates
  clearDateSelection() {
    this.bsValue = [];
    this.dateRangeModalRef?.hide();
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
      startConception: f.dc ? new Date(formatDate(f.dc, 'dd-MM-yyyy', 'fr-FR')) : null,
      endConception: f.fc ? new Date(formatDate(f.fc, 'dd-MM-yyyy', 'fr-FR')) : null,
      startMethode: f.dm ? new Date(formatDate(f.dm, 'dd-MM-yyyy', 'fr-FR')) : null,
      endMethode: f.fm ? new Date(formatDate(f.fm, 'dd-MM-yyyy', 'fr-FR')) : null,
      startProduction: f.dp ? new Date(formatDate(f.dp, 'dd-MM-yyyy', 'fr-FR')) : null,
      endProduction: f.fp ? new Date(formatDate(f.fp, 'dd-MM-yyyy', 'fr-FR')) : null,
      startFc: f.dcf ? new Date(formatDate(f.dcf, 'dd-MM-yyyy', 'fr-FR')) : null,
      endFc: f.fcf ? new Date(formatDate(f.fcf, 'dd-MM-yyyy', 'fr-FR')) : null,
      startDelivery: f.dl ? new Date(formatDate(f.dl, 'dd-MM-yyyy', 'fr-FR')) : null,
      endDelivery: f.fl ? new Date(formatDate(f.fl, 'dd-MM-yyyy', 'fr-FR')) : null,
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