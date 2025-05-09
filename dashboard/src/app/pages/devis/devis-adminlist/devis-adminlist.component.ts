import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Devis } from 'src/app/core/models/Devis/devis';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
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
  selectedYear: string = 'All'; // Default to 'All' to show all years
  searchQuery: string = ''; // Search query for client or project
  p: number = 1; // Current page number
  itemsPerPage: number = 5; // Items per page
  
  searchSubject = new Subject<string>();
  constructor(
    private devisService: DevisService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.loadDevis();
    this.setupSearch();
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
      this.devis = await this.devisService.getAlldevis().toPromise();
      this.applyFilter();
    } catch (error) {
      console.error('Error fetching devis', error);
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
      const yearMatch = this.selectedYear === 'All' || new Date(devis.dateCreation).getFullYear().toString() === this.selectedYear;
      const searchMatch = !this.searchQuery || devis.projet.toLowerCase().includes(this.searchQuery.toLowerCase()) || devis.user?.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      return yearMatch && searchMatch;
    });
  }

  getUniqueYears(): string[] {
    const years = this.devis.map(devis => new Date(devis.dateCreation).getFullYear().toString());
    return ['All', ...Array.from(new Set(years))];
  }

  onYearChange(): void {
    this.applyFilter();
  }



  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmDelete(): void {
    if (this.rejectId !== null) {
      this.devisService.archiver(this.rejectId).subscribe(
        () => {
          Swal.fire({
            title: 'Arrchivé!',
            text: "Devis a été arrchivé avec succès.",
            icon: 'success'
          });

        
          this.ngOnInit();
          this.modalRef?.hide();
        },
        error => {
          console.error('Error deleting cahier des charges', error);
          alert('Cahier des charges not deleted!');
          this.rejectId = null;
          this.modalRef?.hide();
        }
      );
    }
  }
  openDetailsModal(id: number): void {
    this.devisService.getById(id).subscribe(
      (data) => {
        this.devisDetails = data; // Stocker les détails du devis dans this.devisDetails
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
      },
      (error) => {
        console.error('Error fetching devis details', error);
      }
    );
  }
}
