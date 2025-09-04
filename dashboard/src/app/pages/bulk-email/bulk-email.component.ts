import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/core/models/auth.models';
import { EmailService } from 'src/app/core/services/email.service';
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
  isLoading = false;
  isSending = false;
  sendStatus: string = '';
  selectedRecipients: User[] = [];
  selectAll = false;

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService,
    private usersService: UsersService
  ) {
    this.emailForm = this.fb.group({
      recipientType: ['workers', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    
    // Écouter les changements du type de destinataire
    this.emailForm.get('recipientType')?.valueChanges.subscribe(type => {
      this.selectedRecipients = [];
      this.selectAll = false;
      this.updateSelectedRecipients(type);
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    
    // Charger les workers et clients en parallèle
    this.usersService.getWorkers().subscribe({
      next: (workers) => {
        this.workers = workers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des employés', error);
        this.isLoading = false;
      }
    });

    this.usersService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients', error);
      }
    });
  }

  updateSelectedRecipients(type: string): void {
    if (type === 'workers') {
      this.selectedRecipients = [...this.workers];
    } else {
      this.selectedRecipients = [...this.clients];
    }
  }

  toggleSelectAll(): void {
    const type = this.emailForm.get('recipientType')?.value;
    if (this.selectAll) {
      this.updateSelectedRecipients(type);
    } else {
      this.selectedRecipients = [];
    }
  }

  toggleRecipientSelection(recipient: User): void {
    const index = this.selectedRecipients.findIndex(r => r.id === recipient.id);
    if (index > -1) {
      this.selectedRecipients.splice(index, 1);
    } else {
      this.selectedRecipients.push(recipient);
    }
    
    // Mettre à jour l'état de la case à cocher "Tout sélectionner"
    const type = this.emailForm.get('recipientType')?.value;
    const total = type === 'workers' ? this.workers.length : this.clients.length;
    this.selectAll = this.selectedRecipients.length === total;
  }

  isRecipientSelected(recipient: User): boolean {
    return this.selectedRecipients.some(r => r.id === recipient.id);
  }

  getCurrentRecipients(): User[] {
    const type = this.emailForm.get('recipientType')?.value;
    return type === 'workers' ? this.workers : this.clients;
  }

  getSelectedEmails(): string[] {
    return this.selectedRecipients
      .map(r => r.email)
      .filter(email => email !== null && email !== undefined) as string[];
  }

  onSubmit(): void {
    if (this.emailForm.valid && this.selectedRecipients.length > 0) {
      this.isSending = true;
      this.sendStatus = 'Envoi en cours...';
      
      const subject = this.emailForm.get('subject')?.value;
      const message = this.emailForm.get('message')?.value;
      const emails = this.getSelectedEmails();
      
      this.emailService.sendEmail(emails, subject, message).subscribe({
        next: () => {
          this.sendStatus = 'Emails envoyés avec succès!';
          this.isSending = false;
          setTimeout(() => {
            this.sendStatus = '';
            this.emailForm.reset({ recipientType: this.emailForm.get('recipientType')?.value });
          }, 3000);
        },
        error: (error) => {
          console.error('Erreur lors de l\'envoi des emails', error);
          this.sendStatus = 'Erreur lors de l\'envoi des emails';
          this.isSending = false;
        }
      });
    }
  }
}