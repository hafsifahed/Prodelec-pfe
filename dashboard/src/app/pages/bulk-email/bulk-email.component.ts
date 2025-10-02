import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuillModules } from 'ngx-quill';
import { User } from 'src/app/core/models/auth.models';
import { Partner } from 'src/app/core/models/partner.models';
import { Action, Resource } from 'src/app/core/models/role.model';
import { EmailService } from 'src/app/core/services/email.service';
import { PartnersService } from 'src/app/core/services/partners.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { UsersService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-bulk-email',
  templateUrl: './bulk-email.component.html',
  styleUrls: ['./bulk-email.component.scss']
})
export class BulkEmailComponent implements OnInit {
  emailForm: FormGroup;
  workers: User[] = [];
  clients: User[] = [];
  partners: Partner[] = [];
  filteredRecipients: User[] = [];
  isLoading = false;
  isSending = false;
  sendStatus: string = '';
  sendStatusType: 'success' | 'error' | '' = '';
  selectedRecipients: User[] = [];
  selectAll = false;
  searchTerm: string = '';
    Resource = Resource; // pour utiliser Resource dans le template
  Action = Action;

   // Quill Editor Configuration
  quillConfig: QuillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  //    ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
//      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
   //   [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
     // [{ 'direction': 'rtl' }],                         // text direction
    //  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, false] }],
      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],                                         // remove formatting
      ['link']                         // link and image, video
    ]
  };

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService,
    private usersService: UsersService,
    private partnerService: PartnersService,
        public userState: UserStateService // <-- injecté ici
  ) {
    this.emailForm = this.fb.group({
      recipientType: ['workers', Validators.required],
      partner: [null],
      subject: ['', [Validators.required, Validators.maxLength(150)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadPartners();
    
    // Écouter les changements du type de destinataire
    this.emailForm.get('recipientType')?.valueChanges.subscribe(type => {
      this.selectedRecipients = [];
      this.selectAll = false;
      this.searchTerm = '';
      this.emailForm.get('search')?.setValue('');
      this.emailForm.get('partner')?.setValue(null);
      this.updateFilteredRecipients();
    });

    // Écouter les changements du partenaire
    this.emailForm.get('partner')?.valueChanges.subscribe(partnerId => {
      this.selectedRecipients = [];
      this.selectAll = false;
      this.updateFilteredRecipients();
    });

    // Écouter les changements de recherche
    this.emailForm.get('search')?.valueChanges.subscribe(term => {
      this.searchTerm = term;
      this.updateFilteredRecipients();
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    
    // Charger les workers et clients en parallèle
    this.usersService.getWorkers().subscribe({
      next: (workers) => {
        this.workers = workers;
        this.updateFilteredRecipients();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des employés', error);
        this.isLoading = false;
        this.showStatus('Erreur lors du chargement des employés', 'error');
      }
    });

    this.usersService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.updateFilteredRecipients();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients', error);
        this.showStatus('Erreur lors du chargement des clients', 'error');
      }
    });
  }

  loadPartners(): void {
    this.partnerService.getAllPartners().subscribe({
      next: (partners) => {
        this.partners = partners;
        console.log('Partenaires chargés:', partners);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des partenaires', error);
        this.showStatus('Erreur lors du chargement des partenaires', 'error');
      }
    });
  }

  updateFilteredRecipients(): void {
    const type = this.emailForm.get('recipientType')?.value;
    const partnerId = this.emailForm.get('partner')?.value;
    const searchTerm = this.searchTerm.toLowerCase();
    
    let recipients: User[] = [];
    
    // Récupérer les destinataires selon le type sélectionné
    if (type === 'workers') {
      recipients = [...this.workers];
    } else if (type === 'clients') {
      recipients = [...this.clients];
    } else if (type === 'partner' && partnerId) {
      // Convertir partnerId en nombre pour la comparaison
      const numericPartnerId = Number(partnerId);
      const partner = this.partners.find(p => p.id === numericPartnerId);
      console.log('Partenaire sélectionné:', partner);
      recipients = partner && partner.users ? [...partner.users] : [];
      console.log('Utilisateurs du partenaire:', recipients);
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      this.filteredRecipients = recipients.filter(recipient => 
        (recipient.firstName && recipient.firstName.toLowerCase().includes(searchTerm)) ||
        (recipient.lastName && recipient.lastName.toLowerCase().includes(searchTerm)) ||
        (recipient.email && recipient.email.toLowerCase().includes(searchTerm))
      );
    } else {
      this.filteredRecipients = recipients;
    }
    
    console.log('Destinataires filtrés:', this.filteredRecipients);
  }

  toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedRecipients = [...this.filteredRecipients];
    } else {
      this.selectedRecipients = [];
    }
    this.selectAll = !this.selectAll;
  }

  toggleRecipientSelection(recipient: User): void {
    const index = this.selectedRecipients.findIndex(r => r.id === recipient.id);
    if (index > -1) {
      this.selectedRecipients.splice(index, 1);
    } else {
      this.selectedRecipients.push(recipient);
    }
    
    // Mettre à jour l'état de la case à cocher "Tout sélectionner"
    this.selectAll = this.selectedRecipients.length === this.filteredRecipients.length;
  }

  isRecipientSelected(recipient: User): boolean {
    return this.selectedRecipients.some(r => r.id === recipient.id);
  }

  getSelectedEmails(): string[] {
    return this.selectedRecipients
      .map(r => r.email)
      .filter(email => email !== null && email !== undefined) as string[];
  }

  showStatus(message: string, type: 'success' | 'error' = 'success'): void {
    this.sendStatus = message;
    this.sendStatusType = type;
    
    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
      this.sendStatus = '';
      this.sendStatusType = '';
    }, 5000);
  }

 onSubmit(): void {
    if (this.emailForm.valid && this.selectedRecipients.length > 0) {
      this.isSending = true;
      this.showStatus('Envoi en cours...');
      
      const subject = this.emailForm.get('subject')?.value;
      const message = this.emailForm.get('message')?.value;
      const emails = this.getSelectedEmails();
      
      this.emailService.sendEmail(emails, subject, message).subscribe({
        next: () => {
          this.showStatus(`Emails envoyés avec succès à ${emails.length} destinataires!`);
          this.isSending = false;
          this.emailForm.get('subject')?.reset();
          this.emailForm.get('message')?.setValue(''); // Reset editor content
        },
        error: (error) => {
          console.error('Erreur lors de l\'envoi des emails', error);
          this.showStatus('Erreur lors de l\'envoi des emails', 'error');
          this.isSending = false;
        }
      });
    }


  }
  onContentChanged(content: any) {
    console.log('Editor content changed:', content);
  }
}