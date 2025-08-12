import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ProjectDto } from 'src/app/core/models/projectfo/project-dto';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import Swal from 'sweetalert2';
import { Project } from 'src/app/core/models/projectfo/project';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-project-add-modal',
  templateUrl: './project-add-modal.component.html',
  styleUrls: ['./project-add-modal.component.scss']
})
export class ProjectAddModalComponent implements OnInit {
  @Input() project: Project;
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
    private userStateService:UserStateService
  ) { }

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
    this.user = user;
    });
    this.projectsForm = this.fb.group({
      dlp: ['', [Validators.required]],
      drc: [0, ],
      cdc: ['', ],
      rc: ['', ],
      drm: [0, ],
      cdm: ['', ],
      rm: ['', ],
      drp: [0, ],
      cdp: ['', ],
      rp: ['', ],
      drcf: [0, ],
      cdcf: ['', ],
      rcf: ['', ],
      drl: [0, ],
      cdl: ['', ],
      rl: ['', ],
      dc: ['', ],
      fc: ['', ],
      dm: ['', ],
      fm: ['', ],
      dp: ['', ],
      fp: ['', ],
      dcf: ['', ],
      fcf: ['', ],
      dl: ['', ],
      fl: ['', ],
      conceptionChecked: [false],
      methodeChecked: [false],
      productionChecked: [false],
      controleChecked: [false],
      livraisonChecked: [false],
      qte: ['', [Validators.required]]
    });
  }

  toggleSection(section: keyof typeof this.showSections) {
    this.showSections[section] = !this.showSections[section];
  }

  addproject() {
    if (this.projectsForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Formulaire invalide',
        text: 'Veuillez remplir tous les champs obligatoires correctement.',
      });
      return;
    }

    const formValue = this.projectsForm.value;
    const project: ProjectDto = {
      refClient: this.project.refClient,
      refProdelec: this.project.refProdelec,
      qte: formValue.qte,
      dlp: formValue.dlp,
      duree: formValue.drc + formValue.drm + formValue.drp + formValue.drcf + formValue.drl,
      conceptionComment: formValue.cdc,
      conceptionDuration: formValue.drc,
      methodeComment: formValue.cdm,
      methodeDuration: formValue.drm,
      productionComment: formValue.cdp,
      productionDuration: formValue.drp,
      finalControlComment: formValue.cdcf,
      finalControlDuration: formValue.drcf,
      deliveryComment: formValue.cdl,
      deliveryDuration: formValue.drl,
      startConception: formValue.dc ? new Date(formatDate(formValue.dc, 'yyyy-MM-dd', 'en-US')) : null,
      endConception: formValue.fc ? new Date(formatDate(formValue.fc, 'yyyy-MM-dd', 'en-US')) : null,
      startMethode: formValue.dm ? new Date(formatDate(formValue.dm, 'yyyy-MM-dd', 'en-US')) : null,
      endMethode: formValue.fm ? new Date(formatDate(formValue.fm, 'yyyy-MM-dd', 'en-US')) : null,
      startProduction: formValue.dp ? new Date(formatDate(formValue.dp, 'yyyy-MM-dd', 'en-US')) : null,
      endProduction: formValue.fp ? new Date(formatDate(formValue.fp, 'yyyy-MM-dd', 'en-US')) : null,
      startFc: formValue.dcf ? new Date(formatDate(formValue.dcf, 'yyyy-MM-dd', 'en-US')) : null,
      endFc: formValue.fcf ? new Date(formatDate(formValue.fcf, 'yyyy-MM-dd', 'en-US')) : null,
      startDelivery: formValue.dl ? new Date(formatDate(formValue.dl, 'yyyy-MM-dd', 'en-US')) : null,
      endDelivery: formValue.fl ? new Date(formatDate(formValue.fl, 'yyyy-MM-dd', 'en-US')) : null,
      conceptionExist: formValue.conceptionChecked,
      methodeExist: formValue.methodeChecked,
      productionExist: formValue.productionChecked,
      finalControlExist: formValue.controleChecked,
      deliveryExist: formValue.livraisonChecked,
    };

    const respcons = (formValue.rc || '').trim() || undefined;
    const resmeth = (formValue.rm || '').trim() || undefined;
    const resprod = (formValue.rp || '').trim() || undefined;
    const rescf = (formValue.rcf || '').trim() || undefined;
    const resliv = (formValue.rl || '').trim() || undefined;

    this.projectservice.createProject(project, this.project.order.idOrder, respcons, resmeth, resprod, rescf, resliv).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Projet ajouté',
          showConfirmButton: false,
          timer: 1500
        });
        this.projectAdded.emit();
        this.closeModal();
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
    this.modalClosed.emit();
  }
}