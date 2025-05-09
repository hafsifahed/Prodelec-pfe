import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Reclamation } from 'src/app/core/models/reclamation';
import Swal from 'sweetalert2';
import { ReclamationService } from 'src/app/core/services/Reclamation/reclamation.service';
import { UserModel } from 'src/app/core/models/user.models';
import { UsersService } from 'src/app/core/services/users.service';
@Component({
  selector: 'app-reclamation-archive-userlist',
  templateUrl: './reclamation-archive-userlist.component.html',
  styleUrls: ['./reclamation-archive-userlist.component.scss']
})
export class ReclamationArchiveUserlistComponent {
  reclamation: Reclamation[] = [];
  rec : Reclamation;
  filteredReclamations : Reclamation[] = [];
  modalRef?: BsModalRef;
  reclamationForm: FormGroup;
  rejectId : number; 
  p: number = 1; // Current page number
  itemsPerPage: number = 6;
  selectedYear: string = 'All';
  selectedType: string = 'All';
  searchQuery: string = '';
  isAscending : boolean = true;
  user: UserModel | null = null;
  errorMessage: string;
  userEmail = localStorage.getItem('userMail') || '';
  constructor(
    private reclamationService: ReclamationService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private usersService: UsersService
  ) {
    this.reclamationForm = this.fb.group({
      type_de_defaut: ['', Validators.required],
      description: ['', Validators.required],
      pieceJointe: [null]
    });
  }
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;


  openDetailsModal(id: number): void {
    this.reclamationService.getById(id).subscribe(
      (data) => {
        this.rec= data; // Stocker les détails du cahier dans this.cahier
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
     
      },
      (error) => {
        console.error('Error fetching cahier des charges details', error);
      }
    );
  }

  ngOnInit(): void {
      if (this.userEmail) {
        this.fetchUser(this.userEmail);
      }
  }
fetchUser(email: string): void {
  this.usersService.getUserByEmail(email).subscribe(
      (data) => {
        this.user = data;
        console.log('User data:', this.user); // Debug log
        this.loadReclamation(this.user);
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.filteredReclamations.sort((a, b) => {
      const dateA = new Date(a.dateDeCreation).getTime();
      const dateB = new Date(b.dateDeCreation).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }
  loadReclamation(user: UserModel): void {
    if (user.role === 'CLIENTADMIN') {
      this.reclamationService.getAllreclamation().subscribe(
        (data) => {
          // Filter the fetched reclamations by partner
          this.reclamation = data.filter(reclamation => reclamation.user.partner.id === user.partner.id && reclamation.archiveU);
          this.applyFilter();
          console.log('Loaded and filtered reclamations for partner:', this.filteredReclamations); // Debug log
        },
        (error) => {
          console.error('Error fetching reclamations for partner', error);
        }
      );
    } else {
      this.reclamationService.getByIdUser(user.id).subscribe(
        (data) => {
          this.reclamation = data.filter(reclamation => reclamation.archiveU); // Filter out archived reclamations
          this.applyFilter();
          console.log('Loaded and filtered reclamations:', this.filteredReclamations); // Debug log
        },
        (error) => {
          console.error('Error fetching user reclamations', error);
        }
      );
    }
  }

  onYearChange(): void {
    this.applyFilter();
  }

  onTypeChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredReclamations = this.reclamation;

    if (this.selectedYear !== 'All') {
      this.filteredReclamations = this.filteredReclamations.filter(reclamation => {
        const year = new Date(reclamation.dateDeCreation).getFullYear().toString();
        return year === this.selectedYear;
      });
    }

    if (this.selectedType !== 'All') {
      this.filteredReclamations = this.filteredReclamations.filter(reclamation => reclamation.type_de_defaut === this.selectedType);
    }

    if (this.searchQuery.trim() !== '') {
      this.filteredReclamations = this.filteredReclamations.filter(reclamation => reclamation.user.email.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
  }

  getUniqueYears(): string[] {
    const years = this.reclamation.map(reclamation => new Date(reclamation.dateDeCreation).getFullYear().toString());
    return ['All', ...Array.from(new Set(years))];
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }


  confirmDelete(): void {
    if (this.rejectId !== null) {
      this.reclamationService.RestorerU(this.rejectId).subscribe(
        () => {
          Swal.fire({
            title: 'Supprimé!',
            text: "Le cahier des charges a été supprimé avec succès.",
            icon: 'success'
          })
     
          this.reclamation = this.reclamation.filter(reclamation => reclamation.id_Reclamation !== this.rejectId);
          this.rejectId = null;
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

  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

}
