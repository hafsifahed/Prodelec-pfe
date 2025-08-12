import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  projectForm!: FormGroup;
  showSections = {
    conception: false,
    methode: false,
    production: false,
    controle: false,
    livraison: false
  };

  constructor(
    private fb: FormBuilder,
    private projectservice: ProjectService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      refc: ['', [Validators.required]],
      refp: ['', [Validators.required]],
      dlp: ['', [Validators.required]],
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
      conceptionChecked: [false],
      methodeChecked: [false],
      productionChecked: [false],
      controleChecked: [false],
      livraisonChecked: [false],
      qte: [0, [Validators.required]],
    });
  }

  toggleSection(section: string) {
    switch (section) {
      case 'conception': this.showSections.conception = !this.showSections.conception; break;
      case 'methode': this.showSections.methode = !this.showSections.methode; break;
      case 'production': this.showSections.production = !this.showSections.production; break;
      case 'controle': this.showSections.controle = !this.showSections.controle; break;
      case 'livraison': this.showSections.livraison = !this.showSections.livraison; break;
    }
  }

  addproject() {
    if (this.projectForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Formulaire invalide',
        text: 'Veuillez remplir tous les champs obligatoires.',
      });
      return;
    }

    const formValue = this.projectForm.value;

    const project: ProjectDto = {
      refClient: formValue.refc,
      refProdelec: formValue.refp,
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

    this.projectservice
      .createProject(project, this.idorder, respcons, resmeth, resprod, rescf, resliv)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Projet ajouté',
            showConfirmButton: false,
            timer: 1500,
          });
          this.router.navigate(['/listproject']);
          this.closeModal();
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error?.message || 'Une erreur est survenue lors de la création du projet.',
            footer: 'Veuillez réessayer',
          });
        },
      });
  }

  closeModal() {
    this.modalClosed.emit();
  }
}