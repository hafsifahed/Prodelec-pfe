import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, ValidationErrors, AbstractControl, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ProjectDto } from 'src/app/core/models/projectfo/project-dto';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import Swal from 'sweetalert2';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-project-add-modal',
  templateUrl: './project-add-modal.component.html',
  styleUrls: ['./project-add-modal.component.scss']
})
export class ProjectAddModalComponent implements OnInit {
  @Input() project: any;
  @Input() listr: any[] = [];
  @Output() projectAdded = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();
  user: User | null = null;

  projectsForm!: UntypedFormGroup;
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
    private userStateService: UserStateService,
  ) {}

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
      this.user = user;
    });

    this.initForm();
  }

  private initForm() {
    this.projectsForm = this.fb.group({
      dlp: ['', [Validators.required]],
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
      dc: [''],
      fc: [''],
      dm: [''],
      fm: [''],
      dp: [''],
      fp: [''],
      dcf: [''],
      fcf: [''],
      dl: [''],
      fl: [''],
      conceptionChecked: [false],
      methodeChecked: [false],
      productionChecked: [false],
      controleChecked: [false],
      livraisonChecked: [false],
      qte: ['', [Validators.required]]
    }, { validators: this.phasesValidator });
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
        if (anyFieldFilled && !(durationFilled && pilotFilled && startFilled && endFilled)) {
          return {
            [`${phase.prefix}Incomplete`]:
              `Tous les champs (durée, pilote, date début, date fin) sont obligatoires pour la phase ${phase.prefix} si un champ est rempli.`
          };
        }
      } else {
        if (anyFieldFilled && !(durationFilled && pilotFilled && startFilled && endFilled)) {
          return {
            [`${phase.prefix}Incomplete`]:
              `Phase ${phase.prefix} non cochée : si un champ est rempli, tous les champs (durée, pilote, date début, date fin) sont obligatoires.`
          };
        }
      }

      if (startFilled && endFilled) {
        const startDate = new Date(startRaw);
        const endDate = new Date(endRaw);
        if (startDate > endDate) {
          return {
            [`${phase.prefix}DateInvalid`]: `La date de début de la phase ${phase.prefix} ne peut pas être après la date de fin.`
          };
        }
        if (dlp && (startDate > dlp || endDate > dlp)) {
          return {
            [`${phase.prefix}DateAfterDelivery`]: `Les dates de la phase ${phase.prefix} ne peuvent pas être après la date de livraison prévue.`
          };
        }
      }
    }

    return null; // Validation OK
  }

  addproject() {
    if (this.projectsForm.invalid) {
      const errors = this.projectsForm.errors;
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

    const f = this.projectsForm.value;
    const drc = Number(f.drc) || 0;
    const drm = Number(f.drm) || 0;
    const drp = Number(f.drp) || 0;
    const drcf = Number(f.drcf) || 0;
    const drl = Number(f.drl) || 0;

    const project: ProjectDto = {
      refClient: this.project?.refClient,
      refProdelec: this.project?.refProdelec,
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

    this.projectservice.createProject(project, this.project?.order?.idOrder, respcons, resmeth, resprod, rescf, resliv).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Projet ajouté',
          showConfirmButton: false,
          timer: 1500,
        });
        this.projectAdded.emit();
        this.closeModal();
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.error?.message || 'Une erreur est survenue lors de la création du projet.',
          footer: 'Veuillez réessayer'
        });
      }
    });
  }

  // Vide le formulaire et ferme la modale
  closeModal() {
    this.projectsForm.reset({
      dlp: '',
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
      dc: '',
      fc: '',
      dm: '',
      fm: '',
      dp: '',
      fp: '',
      dcf: '',
      fcf: '',
      dl: '',
      fl: '',
      conceptionChecked: false,
      methodeChecked: false,
      productionChecked: false,
      controleChecked: false,
      livraisonChecked: false,
      qte: ''
    });
    this.modalClosed.emit();
  }
}
