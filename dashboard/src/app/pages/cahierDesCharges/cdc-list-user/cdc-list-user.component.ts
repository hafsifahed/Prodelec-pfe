import { Component, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import Swal from 'sweetalert2';
import { AddCdCComponent } from '../add-cd-c/add-cd-c.component';
import { UsersService } from 'src/app/core/services/users.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { User } from 'src/app/core/models/auth.models';

@Component({
  selector: 'app-cdc-list-user',
  templateUrl: './cdc-list-user.component.html',
  styleUrls: ['./cdc-list-user.component.scss']
})
export class CDCListUserComponent {
  cahierDesCharges: CahierDesCharges[]=[];
  cahier: CahierDesCharges;
  modalRef?: BsModalRef;
  submitted = false;
  deleteId: number | null = null;
  searchTitle: string = '';
  filterYear: string = '';
  p: number = 1; // Current page number
  itemsPerPage: number = 5; // Items per page
  isAscending: boolean = true;
  user: User | null = null;
  errorMessage: string;

  constructor(private cdcService: CdcServiceService,
     private modalService: BsModalService ,
      private usersService: UsersService,
      private userStateService: UserStateService
      
    ) { } 

  ngOnInit(): void {

   this.userStateService.user$.subscribe(user => {
      this.user = user;
    });
  
  }

  loadCDC(user: User): void {
    if (user.role.name === 'CLIENTADMIN') {
      // Fetch all CDCs and filter them based on the partner
      this.cdcService.getAllCdc().subscribe(
        (data) => {
          // Filter based on the partner and non-archived status
          this.cahierDesCharges = data.filter(cdc => cdc.user.partner.id === user.partner.id && !cdc.archiveU);
     // Ensure the filter is applied
          console.log('Loaded and filtered CDCs for partner:', this.cahierDesCharges); // Debug log
        },
        (error) => {
          console.error('Error fetching all CDCs for partner', error);
        }
      );
    } else {
      // Fetch CDCs for the specific user
      this.cdcService.getByIdUser(user.id).subscribe(
        (data) => {
          this.cahierDesCharges = data.filter(cdc => !cdc.archiveU);
       // Ensure the filter is applied
          console.log('Loaded and filtered CDCs for user:', this.cahierDesCharges); // Debug log
        },
        (error) => {
          console.error('Error fetching user CDCs', error);
        }
      );
    }
  }
  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.cahierDesCharges.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  getNonArchivedCahiers(): CahierDesCharges[] {
  if (!this.cahierDesCharges || !this.user) {
    return [];
  }
  return this.cahierDesCharges.filter(cdc => 
    cdc.user.partner.name === this.user.partner.name &&
    !cdc.archiveU && 
    (!this.searchTitle || cdc.titre.toLowerCase().includes(this.searchTitle.toLowerCase())) &&
    (!this.filterYear || new Date(cdc.createdAt).getFullYear().toString() === this.filterYear)
  );
}


  getAvailableYears(): string[] {
  if (!this.cahierDesCharges || this.cahierDesCharges.length === 0) {
    return [];
  }
  const years = this.cahierDesCharges.map(cdc => new Date(cdc.createdAt).getFullYear().toString());
  return Array.from(new Set(years));
}



  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.deleteId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmDelete(): void {
    if (this.deleteId !== null) {
      this.cdcService.archiverU(this.deleteId).subscribe(
        () => {
          Swal.fire({
            title: 'Archivé!',
            text: "Le cahier des charges a été archivé avec succès.",
            icon: 'success'
          });

        
          this.ngOnInit();
          this.modalRef?.hide();
        },
        error => {
          console.error('Error deleting cahier des charges', error);
          alert('Cahier des charges not deleted!');
          this.deleteId = null;
          this.modalRef?.hide();
        }
      );
    }
  }

  @ViewChildren(CDCListUserComponent) headers!: QueryList<CDCListUserComponent>;
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('removeItemModal', { static: false }) removeItemModal?: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;
  @ViewChild('addCdcModal') addCdcModal!: TemplateRef<AddCdCComponent>; 
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;

  openDetailsModal(id: number): void {
    this.cdcService.getById(id).subscribe(
      data => {
        this.cahier = data; // Stocker les détails du cahier dans this.cahier
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
      },
      error => {
        console.error('Error fetching cahier des charges details', error);
      }
    );
  }

  openViewModal(content: any) {
    this.modalRef = this.modalService.show(content);
  }

  openModal(content: any) {
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
  }

  handleCahierDesChargesAdded() {
    Swal.fire({
      title: 'Ajouté!',
      text: "Le cahier des charges a été ajouté avec succès.",
      icon: 'success'
    }).then(() => {
      this.modalRef?.hide(); 
      console.log("from modal !!!!"); // Fermer le modal après l'ajout réussi
    });
  }
}
