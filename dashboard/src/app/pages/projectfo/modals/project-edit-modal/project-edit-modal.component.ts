import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { ProjectDto } from 'src/app/core/models/projectfo/project-dto';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import Swal from 'sweetalert2';
import { Project } from 'src/app/core/models/projectfo/project';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { frLocale } from 'ngx-bootstrap/locale';
import { Subscription } from 'rxjs';

// Définir la locale française
defineLocale('fr', frLocale);

@Component({
  selector: 'app-project-edit-modal',
  templateUrl: './project-edit-modal.component.html',
  styleUrls: ['./project-edit-modal.component.scss']
})
export class ProjectEditModalComponent implements OnInit, OnDestroy {
  @Input() project!: Project;
  @Input() listr: any[] = [];
  @Output() projectUpdated = new EventEmitter<void>();
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
  user: User | null = null;
  private valueChangesSubscriptions: Subscription[] = [];
  // Propriétés pour le date range picker
  bsConfig: Partial<BsDaterangepickerConfig>;
  bsValue: Date[] = [];
  dateRangeModalRef?: BsModalRef;
  activeDateField: string = '';

  constructor(
    private fb: UntypedFormBuilder,
    private projectservice: ProjectService,
    private userStateService: UserStateService,
    private modalService: BsModalService,
    private localeService: BsLocaleService
  ) {
    this.localeService.use('fr');
  }

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
      this.user = user;
    });

    // Configuration du datepicker
    this.bsConfig = Object.assign({}, {
      containerClass: 'theme-dark-blue',
      rangeInputFormat: 'DD/MM/YYYY',
      showWeekNumbers: false,
      isAnimated: true,
      dateInputFormat: 'DD/MM/YYYY'
    });

    this.projectForm = this.fb.group({
      refc: [''],
      refp: [''],
      dlp: [null],
      drc: [0],
      cdc: [''],
      rc: [''],
      drm: [0],
      cdm: [''],
      rm: [''],
      drp: [0],
      cdp: [''],
      rp: [''],
      drcf: [0],
      cdcf: [''],
      rcf: [''],
      drl: [0],
      cdl: [''],
      rl: [''],
      dc: [null],
      fc: [null],
      dm: [null],
      fm: [null],
      dp: [null],
      fp: [null],
      dcf: [null],
      fcf: [null],
      dl: [null],
      fl: [null],
      conceptionChecked: [false],
      methodeChecked: [false],
      productionChecked: [false],
      controleChecked: [false],
      livraisonChecked: [false],
      qte: [0]
    }, { validators: this.phasesValidator });

    if (this.project) {
      this.projectForm.patchValue({
        refc: this.project.refClient,
        refp: this.project.refProdelec,
        rc: this.project.conceptionResponsible?.firstName || '',
        rm: this.project.methodeResponsible?.firstName || '',
        rp: this.project.productionResponsible?.firstName || '',
        rcf: this.project.finalControlResponsible?.firstName || '',
        rl: this.project.deliveryResponsible?.firstName || '',
        dlp: this.project.dlp ? new Date(this.project.dlp) : null,
        dc: this.project.startConception ? new Date(this.project.startConception) : null,
        fc: this.project.endConception ? new Date(this.project.endConception) : null,
        dm: this.project.startMethode ? new Date(this.project.startMethode) : null,
        fm: this.project.endMethode ? new Date(this.project.endMethode) : null,
        dp: this.project.startProduction ? new Date(this.project.startProduction) : null,
        fp: this.project.endProduction ? new Date(this.project.endProduction) : null,
        dcf: this.project.startFc ? new Date(this.project.startFc) : null,
        fcf: this.project.endFc ? new Date(this.project.endFc) : null,
        dl: this.project.startDelivery ? new Date(this.project.startDelivery) : null,
        fl: this.project.endDelivery ? new Date(this.project.endDelivery) : null,
        drc: this.project.conceptionDuration ?? 0,
        cdc: this.project.conceptionComment ?? '',
        drm: this.project.methodeDuration ?? 0,
        cdm: this.project.methodeComment ?? '',
        drp: this.project.productionDuration ?? 0,
        cdp: this.project.productionComment ?? '',
        drcf: this.project.finalControlDuration ?? 0,
        cdcf: this.project.finalControlComment ?? '',
        drl: this.project.deliveryDuration ?? 0,
        cdl: this.project.deliveryComment ?? '',
        qte: this.project.qte,
        conceptionChecked: this.project.conceptionExist ?? false,
        methodeChecked: this.project.methodeExist ?? false,
        productionChecked: this.project.productionExist ?? false,
        controleChecked: this.project.finalControlExist ?? false,
        livraisonChecked: this.project.deliveryExist ?? false,
      });
    }

    // Abonnements aux changements des cases à cocher
    this.valueChangesSubscriptions.push(
      this.projectForm.get('conceptionChecked')?.valueChanges.subscribe((checked) => {
        if (!checked) this.showSections.conception = false;
      }) as Subscription
    );

    this.valueChangesSubscriptions.push(
      this.projectForm.get('methodeChecked')?.valueChanges.subscribe((checked) => {
        if (!checked) this.showSections.methode = false;
      }) as Subscription
    );

    this.valueChangesSubscriptions.push(
      this.projectForm.get('productionChecked')?.valueChanges.subscribe((checked) => {
        if (!checked) this.showSections.production = false;
      }) as Subscription
    );

    this.valueChangesSubscriptions.push(
      this.projectForm.get('controleChecked')?.valueChanges.subscribe((checked) => {
        if (!checked) this.showSections.controle = false;
      }) as Subscription
    );

    this.valueChangesSubscriptions.push(
      this.projectForm.get('livraisonChecked')?.valueChanges.subscribe((checked) => {
        if (!checked) this.showSections.livraison = false;
      }) as Subscription
    );
  }

  ngOnDestroy(): void {
    // Désabonnement pour éviter les fuites de mémoire
    this.valueChangesSubscriptions.forEach(sub => sub.unsubscribe());
  }

  // Ouvrir le modal de sélection de dates
  openDateRangeModal(field: string) {
    this.activeDateField = field;

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

  toggleSection(section: keyof typeof this.showSections) {
    this.showSections[section] = !this.showSections[section];
  }

  phasesValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const dlpRaw = group.get('dlp')?.value;
    const dlp = dlpRaw ? new Date(dlpRaw) : null;
    if (!dlp) return null;
    const phases = [
      { prefix: 'conception', checkedKey: 'conceptionChecked', durationKey: 'drc', pilotKey: 'rc', startKey: 'dc', endKey: 'fc' },
      { prefix: 'methode', checkedKey: 'methodeChecked', durationKey: 'drm', pilotKey: 'rm', startKey: 'dm', endKey: 'fm' },
      { prefix: 'production', checkedKey: 'productionChecked', durationKey: 'drp', pilotKey: 'rp', startKey: 'dp', endKey: 'fp' },
      { prefix: 'controle', checkedKey: 'controleChecked', durationKey: 'drcf', pilotKey: 'rcf', startKey: 'dcf', endKey: 'fcf' },
      { prefix: 'livraison', checkedKey: 'livraisonChecked', durationKey: 'drl', pilotKey: 'rl', startKey: 'dl', endKey: 'fl' },
    ];
    for (const phase of phases) {
      const checked = group.get(phase.checkedKey)?.value;
      const durationRaw = group.get(phase.durationKey)?.value;
      const pilotRaw = group.get(phase.pilotKey)?.value;
      const startRaw = group.get(phase.startKey)?.value;
      const endRaw = group.get(phase.endKey)?.value;
      // Durée 0 NON considérée comme remplie
      const durationFilled = durationRaw !== null && durationRaw !== undefined && durationRaw !== '' && Number(durationRaw) !== 0;
      const pilotFilled = pilotRaw !== null && pilotRaw !== undefined && pilotRaw.toString().trim() !== '';
      const startFilled = startRaw !== null && startRaw !== undefined && startRaw !== '';
      const endFilled = endRaw !== null && endRaw !== undefined && endRaw !== '';
      const anyFieldFilled = durationFilled || pilotFilled || startFilled || endFilled;
      if (checked) {
        if (anyFieldFilled) {
          if (!(durationFilled && pilotFilled && startFilled && endFilled)) {
            return { [`${phase.prefix}Incomplete`]: `Tous les champs (durée, pilote, date début, date fin) sont obligatoires pour la phase ${phase.prefix} si un champ est rempli.` };
          }
        }
      } else {
        if (anyFieldFilled) {
          if (!(durationFilled && pilotFilled && startFilled && endFilled)) {
            return { [`${phase.prefix}Incomplete`]: `Phase ${phase.prefix} non cochée : si un champ est rempli, tous les champs (durée, pilote, date début, date fin) sont obligatoires.` };
          }
        }
      }
      if (startFilled && endFilled) {
        const startDate = new Date(startRaw);
        const endDate = new Date(endRaw);
        if (startDate > endDate) {
          return { [`${phase.prefix}DateInvalid`]: `La date de début de la phase ${phase.prefix} ne peut pas être après la date de fin.` };
        }
        if (dlp && (startDate > dlp || endDate > dlp)) {
          return { [`${phase.prefix}DateAfterDelivery`]: `Les dates de la phase ${phase.prefix} ne peuvent pas être après la date de livraison prévue.` };
        }
      }
    }
    return null;
  }

  updateproject() {
    if (this.projectForm.invalid) {
      const errors = this.projectForm.errors;
      let msg = 'Veuillez vérifier les champs.';
      if (errors) msg = Object.values(errors).join('\n');
      Swal.fire({
        icon: 'error',
        title: 'Erreur de validation',
        text: msg,
      });
      return;
    }

    const f = this.projectForm.value;
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
      startConception: f.dc ? new Date(f.dc) : null,
      endConception: f.fc ? new Date(f.fc) : null,
      startMethode: f.dm ? new Date(f.dm) : null,
      endMethode: f.fm ? new Date(f.fm) : null,
      startProduction: f.dp ? new Date(f.dp) : null,
      endProduction: f.fp ? new Date(f.fp) : null,
      startFc: f.dcf ? new Date(f.dcf) : null,
      endFc: f.fcf ? new Date(f.fcf) : null,
      startDelivery: f.dl ? new Date(f.dl) : null,
      endDelivery: f.fl ? new Date(f.fl) : null,
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

    this.projectservice.updateProject(this.project.idproject, project, respcons, resmeth, resprod, rescf, resliv).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Projet modifié',
          showConfirmButton: false,
          timer: 1500,
        });
        this.projectUpdated.emit();
        this.closeModal();
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.error?.message || 'Une erreur est survenue lors de la modification du projet.',
          footer: 'Veuillez réessayer'
        });
      }
    });
  }

  // Réinitialise le formulaire à son état initial (vide ou à zéro)
  closeModal() {
    this.projectForm.reset({
      refc: '',
      refp: '',
      dlp: null,
      drc: 0,
      cdc: '',
      rc: '',
      drm: 0,
      cdm: '',
      rm: '',
      drp: 0,
      cdp: '',
      rp: '',
      drcf: 0,
      cdcf: '',
      rcf: '',
      drl: 0,
      cdl: '',
      rl: '',
      dc: null,
      fc: null,
      dm: null,
      fm: null,
      dp: null,
      fp: null,
      dcf: null,
      fcf: null,
      dl: null,
      fl: null,
      conceptionChecked: false,
      methodeChecked: false,
      productionChecked: false,
      controleChecked: false,
      livraisonChecked: false,
      qte: 0
    });
    this.modalClosed.emit();
  }
}
