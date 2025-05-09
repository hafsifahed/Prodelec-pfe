import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Reclamation } from 'src/app/core/models/reclamation';
import { EmailService } from 'src/app/core/services/email.service';
import { ReclamationService } from 'src/app/core/services/Reclamation/reclamation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reclamation-admin-list',
  templateUrl: './reclamation-admin-list.component.html',
  styleUrls: ['./reclamation-admin-list.component.scss']
})
export class ReclamationAdminListComponent {
  reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];
  reclamation: Reclamation;
  modalRef?: BsModalRef;
  reponse: string = '';
  rejectId: number | null = null;
  selectedFile: File | null = null;
  p: number = 1; // Current page number
  itemsPerPage: number = 6;
  selectedYear: string = 'All';
  selectedType: string = 'All';
  searchQuery: string = '';
  isAscending : boolean = true ;
  constructor(
    private reclamationService: ReclamationService,
    private modalService: BsModalService,
    private emailService: EmailService
  ) {}

  ngOnInit(): void {
    this.loadReclamation();
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.filteredReclamations.sort((a, b) => {
      const dateA = new Date(a.dateDeCreation).getTime();
      const dateB = new Date(b.dateDeCreation).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  loadReclamation(): void {
    this.reclamationService.getAllreclamation().subscribe(
      (data) => {
        this.reclamations = data;
        this.applyFilter();
        console.log('Loaded reclamations:', this.reclamations); // Debug log
      },
      (error) => {
        console.error('Error fetching reclamations', error);
      }
    );
  }

  telechargerPieceJointe(fileName: string, id: number): void {
    this.reclamationService.getById(id).subscribe({
      next: (rec: Reclamation) => {
        this.reclamationService.downloadFile(fileName, rec.user).subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          },
          error: (error) => {
            console.error('Error downloading file', error);
            if (error.status === 404) {
              console.error('File not found:', fileName);
            }
          }
        });
      },
      error: (error) => {
        console.error('Error fetching Cahier De Charges', error);
      }
    });
  }
  openCommentModal(id: number | undefined, template: TemplateRef<any>): void {
    if (id !== undefined && id !== null) {
      this.rejectId = id;
      console.log('Opening modal for ID:', this.rejectId); // Debug log
      this.reponse = '';
      this.modalRef = this.modalService.show(template, { class: 'modal-md' });
    } else {
      console.error('Invalid ID provided:', id);
    }
  }

  Traiter(): void {
    console.log('Traiter called with ID:', this.rejectId); // Debug log
    console.log('Response:', this.reponse); // Debug log
    if (this.rejectId !== null && this.reponse.trim()) {
      this.reclamationService.traiterRec(this.rejectId, this.reponse).subscribe(
        (response) => {
          console.log('Reclamation processed:', response);
          this.loadReclamation(); // Reload data after processing
          this.reclamationService.getById(this.rejectId).subscribe(
            (reclamation) => {

              const emailText = `
              <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                  }
                  .container {
                    width: 80%;
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  }
                  .header {
                    text-align: center;
                    border-bottom: 2px solid #eeeeee;
                    padding-bottom: 20px;
                  }
                  .header img {
                    height: 50px;
                  }
                  .content {
                    padding: 20px;
                  }
                  .footer {
                    text-align: center;
                    font-size: 14px;
                    color: #666666;
                    padding-top: 20px;
                    border-top: 1px solid #eeeeee;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <img  src="https://www.prodelecna.com/wp-content/uploads/2021/12/logo-PRODELEC.png" class="attachment-large size-large" alt="logo PRODELEC">
                  </div>
                  <div class="content">
                     <h1>Réclamation traitée</h1>
                    <p>Bonjour ${reclamation.user.firstName},</p>
                    <p>Nous tenons à vous informer que votre réclamation a été traitée avec succès.</p>
                    <p>Pour plus de détails, nous vous invitons à vous connecter à votre compte sur notre site. Vous y trouverez toutes les informations pertinentes concernant votre réclamation.</p>
                    <p>Nous restons à votre disposition pour toute question ou information complémentaire.</p>
                    <p>Cordialement,</p>
                    

                  </div>
                  <div class="footer">
                    <p>Prodelec &copy; 2024</p>
                  </div>
                </div>
              </body>
              </html>
                `;
            this.sendmail([reclamation.user.email], "Reclamation Traiter",emailText);
            },
            (error) => {
              console.error('Error fetching reclamation details', error);
            }
          );
          this.modalRef?.hide();
          this.rejectId = null;
          this.reponse = '';
        },
        (error) => {
          console.error('Error processing reclamation', error);
          this.modalRef?.hide();
        }
      );
    }
  }
 sendmail(to: string[], subject: string, text: string) {

    this.emailService.sendEmail(to,subject,text).subscribe(
      (response) => {
        console.log("email Sent",response);
        
      },
      (error) => {
        console.error(error);
  
      }
    );
  }
  saveReclamation() {
    if (this.selectedFile) {
      this.reclamationService.uploadFile(this.selectedFile).subscribe(
        (filename) => {
          console.log('Pièce jointe téléchargée avec succès', filename);
          console.log(this.selectedFile);
        },
        (error) => {
          console.error('Error uploading file', error);
        }
      );
    }
  }
  @ViewChild('commentModal', { static: false }) commentModal?: TemplateRef<any>;
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;
  @ViewChild('pieceJointeModal', { static: false }) pieceJointeModal?: TemplateRef<any>;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmDelete(): void {
    if (this.rejectId !== null) {
      this.reclamationService.archiver(this.rejectId).subscribe(
        () => {
          Swal.fire({
            title: 'Supprimé!',
            text: "La reclamation a été archivé avec succès.",
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
    this.reclamationService.getById(id).subscribe(
      (data) => {
        this.reclamation= data; // Stocker les détails du cahier dans this.cahier
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
        console.log(this.reclamation.reponse);
      },
      (error) => {
        console.error('Error fetching cahier des charges details', error);
      }
    );
  }

  onYearChange(): void {
    this.applyFilter();
  }

  onTypeChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredReclamations = this.reclamations;

    // Exclude archived reclamations
    this.filteredReclamations = this.filteredReclamations.filter(reclamation => !reclamation.archive);

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
    const years = this.reclamations.map(reclamation => new Date(reclamation.dateDeCreation).getFullYear().toString());
    return ['All', ...Array.from(new Set(years))];
  }
}
