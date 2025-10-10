import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Devis, EtatDevis } from 'src/app/core/models/Devis/devis';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ArchiveDevisAdminModalComponent } from '../modals/archive-devis-admin-modal/archive-devis-admin-modal.component';
import { DetailsDevisAdminModalComponent } from '../modals/details-devis-admin-modal/details-devis-admin-modal.component';
import { RefuseDevisAdminModalComponent } from '../modals/refuse-devis-admin-modal/refuse-devis-admin-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Action, Resource } from 'src/app/core/models/role.model';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-devis-adminlist',
  templateUrl: './devis-adminlist.component.html',
  styleUrls: ['./devis-adminlist.component.scss']
})
export class DevisAdminlistComponent implements OnInit {
  modalRef?: BsModalRef;
  rejectId: number | null = null;
  devis: Devis[] = [];
  filteredDevis: Devis[] = [];
  isAscending: boolean = true;
  devisDetails: Devis;
  selectedYear: string = 'All';
  searchQuery: string = '';
  p: number = 1;
  itemsPerPage: number = 5;
  title = 'Devis';
  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Devis', active: true }
  ];
  
  // Pour la mise à jour du fichier
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  EtatDevis = EtatDevis;
  
  searchSubject = new Subject<string>();
  commentaireRefus: string = '';
  Resource = Resource;
Action = Action;

  constructor(
    private devisService: DevisService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    public userState: UserStateService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDevis();
    this.setupSearch();
     this.route.queryParams.subscribe(params => {
      const devisId = params['openDevisModal'];
      if (devisId) {
        // Ouvrir le modal après un court délai pour permettre le rendu de la page
        setTimeout(() => this.openDetailsModal(devisId), 100);
        
        // Nettoyer le paramètre d'URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { openDevisModal: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }
  
  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilter());
  }
  
  onSearchQueryChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  async loadDevis(): Promise<void> {
    try {
      const data = await this.devisService.getAlldevis().toPromise();
      if (data) {
        this.devis = data;
        this.applyFilter();
      }
    } catch (error) {
      console.error('Error fetching devis', error);
      Swal.fire('Erreur', 'Impossible de charger les devis', 'error');
    }
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.filteredDevis.sort((a, b) => {
      return this.isAscending ? 
        new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime() :
        new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
    });
  }

  getNonArchivedDevis(): Devis[] {
    return this.filteredDevis.filter(devis => !devis.archive);
  }

  applyFilter(): void {
    this.filteredDevis = this.devis.filter(devis => {
      const yearMatch = this.selectedYear === 'All' || 
        new Date(devis.dateCreation).getFullYear().toString() === this.selectedYear;
      const searchMatch = !this.searchQuery || 
        devis.projet.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        (devis.user?.email && devis.user.email.toLowerCase().includes(this.searchQuery.toLowerCase()));
      return yearMatch && searchMatch;
    });
  }

  getUniqueYears(): string[] {
    const years = this.devis
      .map(devis => new Date(devis.dateCreation).getFullYear().toString())
      .filter(year => year !== 'NaN');
    return ['All', ...Array.from(new Set(years))];
  }

  onYearChange(): void {
    this.applyFilter();
  }



  openDeleteModal(id: number): void {
  const initialState = { archiveId: id };
  this.modalRef = this.modalService.show(ArchiveDevisAdminModalComponent, { initialState });
  this.modalRef.content.onArchived.subscribe(() => {
    this.loadDevis();
  });
}




  openDetailsModal(id: number): void {
  this.devisService.getById(id).subscribe(
    (data) => {
      const initialState = { devis: data };
      const modalRef = this.modalService.show(DetailsDevisAdminModalComponent, { 
        initialState,
        class: 'modal-lg'
      });
      
      modalRef.content.onDevisUpdated.subscribe(() => {
        this.loadDevis();
      });
      
      modalRef.content.onAccept.subscribe((devisId: number) => {
        this.accepterDevis(devisId);
      });
      
      modalRef.content.onRefuse.subscribe((devisId: number) => {
        this.preparerRefus(devisId);
      });
    }
  );
}

  accepterDevis(id: number): void {
    this.devisService.acceptdevis(id).subscribe(
      (response) => {
        Swal.fire('Succès!', 'Le devis a été accepté.', 'success');
        this.loadDevis();
        if (this.modalRef) {
          this.modalRef.hide();
        }
      },
      (error) => {
        console.error('Erreur lors de l\'acceptation du devis', error);
        Swal.fire('Erreur!', 'Une erreur est survenue lors de l\'acceptation', 'error');
      }
    );
  }


  preparerRefus(id: number): void {
  const initialState = { refuseId: id };
  this.modalRef = this.modalService.show(RefuseDevisAdminModalComponent, { initialState });
  this.modalRef.content.onRefused.subscribe(() => {
    this.loadDevis();
  });
}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }


}