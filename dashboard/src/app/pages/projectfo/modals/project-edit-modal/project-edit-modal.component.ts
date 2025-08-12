import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ProjectDto } from 'src/app/core/models/projectfo/project-dto';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import Swal from 'sweetalert2';
import { Project } from 'src/app/core/models/projectfo/project';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-project-edit-modal',
  templateUrl: './project-edit-modal.component.html',
  styleUrls: ['./project-edit-modal.component.scss']
})
export class ProjectEditModalComponent implements OnInit {
  @Input() project: Project;
  @Input() listr: any[] = [];
  @Output() projectUpdated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  projectForm!: UntypedFormGroup;
  showSections = {
    conception: false,
    methode: false,
    production: false,
    controle: false,
    livraison: false
  };
    user: User | null = null;


  constructor(
    private fb: UntypedFormBuilder,
    private projectservice: ProjectService,
    private userStateService:UserStateService
  ) { }

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
    this.user = user;
  });
  this.projectForm = this.fb.group({
    refc: ['', []],
    refp: ['', []],
    dlp: ['', []],
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
    qte: [0, []]
  });

  if (this.project) {
    this.projectForm.patchValue({
      refc: this.project.refClient,
      refp: this.project.refProdelec,
      rc: this.project.conceptionResponsible?.firstName || '',
      rm: this.project.methodeResponsible?.firstName || '',
      rp: this.project.productionResponsible?.firstName || '',
      rcf: this.project.finalControlResponsible?.firstName || '',
      rl: this.project.deliveryResponsible?.firstName || '',
      dlp: this.project.dlp ? formatDate(this.project.dlp, 'MM/dd/yyyy', 'en-US') : null,
      dc: this.project.startConception ? formatDate(this.project.startConception, 'MM/dd/yyyy', 'en-US') : null,
      fc: this.project.endConception ? formatDate(this.project.endConception, 'MM/dd/yyyy', 'en-US') : null,
      dm: this.project.startMethode ? formatDate(this.project.startMethode, 'MM/dd/yyyy', 'en-US') : null,
      fm: this.project.endMethode ? formatDate(this.project.endMethode, 'MM/dd/yyyy', 'en-US') : null,
      dp: this.project.startProduction ? formatDate(this.project.startProduction, 'MM/dd/yyyy', 'en-US') : null,
      fp: this.project.endProduction ? formatDate(this.project.endProduction, 'MM/dd/yyyy', 'en-US') : null,
      dcf: this.project.startFc ? formatDate(this.project.startFc, 'MM/dd/yyyy', 'en-US') : null,
      fcf: this.project.endFc ? formatDate(this.project.endFc, 'MM/dd/yyyy', 'en-US') : null,
      dl: this.project.startDelivery ? formatDate(this.project.startDelivery, 'yyyy-MM-dd', 'en-US') : null,
      fl: this.project.endDelivery ? formatDate(this.project.endDelivery, 'yyyy-MM-dd', 'en-US') : null,
      drc: this.project.conceptionDuration,
      cdc: this.project.conceptionComment,
      drm: this.project.methodeDuration,
      cdm: this.project.methodeComment,
      drp: this.project.productionDuration,
      cdp: this.project.productionComment,
      drcf: this.project.finalControlDuration,
      cdcf: this.project.finalControlComment,
      drl: this.project.deliveryDuration,
      cdl: this.project.deliveryComment,
      qte: this.project.qte,
      // <-- Ajout des flags ici
      conceptionChecked: this.project.conceptionExist ?? false,
      methodeChecked: this.project.methodeExist ?? false,
      productionChecked: this.project.productionExist ?? false,
      controleChecked: this.project.finalControlExist ?? false,
      livraisonChecked: this.project.deliveryExist ?? false,
    });
  }
}


  toggleSection(section: keyof typeof this.showSections) {
    this.showSections[section] = !this.showSections[section];
  }

  updateproject() {
    const refclient = this.projectForm.get('refc')?.value || '';
    const refProdelec = this.projectForm.get('refp')?.value || '';
    const qte = this.projectForm.get('qte')?.value;
    const datelivprev = new Date(formatDate(this.projectForm.get('dlp')?.value, 'yyyy-MM-dd', 'en-US')) || null;
    
    const dcValue = this.projectForm.get('dc')?.value;
    const fcValue = this.projectForm.get('fc')?.value;
    const dmValue = this.projectForm.get('dm')?.value;
    const fmValue = this.projectForm.get('fm')?.value;
    const dpValue = this.projectForm.get('dp')?.value;
    const fpValue = this.projectForm.get('fp')?.value;
    const dcfValue = this.projectForm.get('dcf')?.value;
    const fcfValue = this.projectForm.get('fcf')?.value;
    const dlValue = this.projectForm.get('dl')?.value;
    const flValue = this.projectForm.get('fl')?.value;

    const debcon = dcValue ? new Date(formatDate(dcValue, 'yyyy-MM-dd', 'en-US')) : null;
    const fincon = fcValue ? new Date(formatDate(fcValue, 'yyyy-MM-dd', 'en-US')) : null;
    const debmeth = dmValue ? new Date(formatDate(dmValue, 'yyyy-MM-dd', 'en-US')) : null;
    const finmeth = fmValue ? new Date(formatDate(fmValue, 'yyyy-MM-dd', 'en-US')) : null;
    const debprod = dpValue ? new Date(formatDate(dpValue, 'yyyy-MM-dd', 'en-US')) : null;
    const finprod = fpValue ? new Date(formatDate(fpValue, 'yyyy-MM-dd', 'en-US')) : null;
    const debcf = dcfValue ? new Date(formatDate(dcfValue, 'yyyy-MM-dd', 'en-US')) : null;
    const fincf = fcfValue ? new Date(formatDate(fcfValue, 'yyyy-MM-dd', 'en-US')) : null;
    const debliv = dlValue ? new Date(formatDate(dlValue, 'yyyy-MM-dd', 'en-US')) : null;
    const finliv = flValue ? new Date(formatDate(flValue, 'yyyy-MM-dd', 'en-US')) : null;
  
    const durecons = Number(this.projectForm.get('drc')?.value) || 0;
    const duremeth = Number(this.projectForm.get('drm')?.value) || 0;
    const durepro = Number(this.projectForm.get('drp')?.value) || 0;
    const durecf = Number(this.projectForm.get('drcf')?.value) || 0;
    const dureliv = Number(this.projectForm.get('drl')?.value) || 0;

    const comcons = this.projectForm.get('cdc')?.value || '';
    const commeth = this.projectForm.get('cdm')?.value || '';
    const comprod = this.projectForm.get('cdp')?.value || '';
    const comcf = this.projectForm.get('cdcf')?.value || '';
    const comliv = this.projectForm.get('cdl')?.value || '';

    const respcons = (this.projectForm.get('rc')?.value || '').trim() || undefined;
    const resmeth = (this.projectForm.get('rm')?.value || '').trim() || undefined;
    const resprod = (this.projectForm.get('rp')?.value || '').trim() || undefined;
    const rescf = (this.projectForm.get('rcf')?.value || '').trim() || undefined;
    const resliv = (this.projectForm.get('rl')?.value || '').trim() || undefined;

    const project: ProjectDto = {
  refClient: refclient,
  refProdelec: refProdelec,
  qte: qte,
  dlp: datelivprev,
  duree: durecons + duremeth + durepro + durecf + dureliv,
  conceptionComment: comcons,
  conceptionDuration: durecons,
  methodeComment: commeth,
  methodeDuration: duremeth,
  productionComment: comprod,
  productionDuration: durepro,
  finalControlComment: comcf,
  finalControlDuration: durecf,
  deliveryComment: comliv,
  deliveryDuration: dureliv,
  startConception: debcon,
  endConception: fincon,
  startMethode: debmeth,
  endMethode: finmeth,
  startProduction: debprod,
  endProduction: finprod,
  startFc: debcf,
  endFc: fincf,
  startDelivery: debliv,
  endDelivery: finliv,
  // Ajouts des flags
  conceptionExist: this.projectForm.get('conceptionChecked')?.value,
  methodeExist: this.projectForm.get('methodeChecked')?.value,
  productionExist: this.projectForm.get('productionChecked')?.value,
  finalControlExist: this.projectForm.get('controleChecked')?.value,
  deliveryExist: this.projectForm.get('livraisonChecked')?.value,
};

  
    this.projectservice
      .updateProject(this.project.idproject, project, respcons, resmeth, resprod, rescf, resliv)
      .subscribe(
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Projet modifié',
            showConfirmButton: false,
            timer: 1500
          });
          this.projectUpdated.emit();
          this.closeModal();
        },
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Une erreur est survenue lors de la modification",
            footer: 'Réessayez'
          });
        }
      );
  }

  closeModal() {
    this.modalClosed.emit();
  }
}