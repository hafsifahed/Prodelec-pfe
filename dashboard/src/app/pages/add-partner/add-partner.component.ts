import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Partner } from '../../core/models/partner.models';
import { PartnersService } from '../../core/services/partners.service';
import {UsersService} from "../../core/services/users.service";
import {NotificationService} from "../../core/services/notification.service";
import {Router} from "@angular/router";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-partner',
  templateUrl: './add-partner.component.html',
  styleUrls: ['./add-partner.component.scss']
})
export class AddPartnerComponent implements OnInit{
  addPartnerForm: FormGroup;
  errorMessage = '';
  userMail = localStorage.getItem('userMail');
  user: any;

  constructor(
      private fb: FormBuilder,
      private partnersService: PartnersService,
      private usersService:UsersService,
      private notificationService:NotificationService,
      private router: Router

  ) {
    this.addPartnerForm = this.fb.group({
      address: ['', Validators.required],
      name: ['', Validators.required],
      tel: ['', Validators.required]
    });
  }

  ngOnInit(): void {

  }

  addPartner(): void {
    if (this.addPartnerForm.valid) {
      const newPartner: Partner = this.addPartnerForm.value;

      this.partnersService.addPartner(newPartner).subscribe(
          () => {
           // this.createNotification('New partner added', 'A new partner has been added.');
           Swal.fire({
            title: 'Succès!',
            text: 'Partenaire ajouté avec succès.',
            icon: 'success'
          });
          this.router.navigate(['/list-partner']);
          },
          (error) => {
            console.error('Error adding partner', error);
            Swal.fire({
              title: 'Erreur!',
              text: 'Erreur lors de l\'ajout du partenaire. Veuillez réessayer ultérieurement.',
              icon: 'error'
            });
          }
      );
    }
  }


  private createNotification(title: string, message: string): void {
    const newNotification = {
      id: 0,
      title: title,
      message: message,
      createdBy: this.user.email, // Replace with the actual creator's name
      read: false,
      userId: 0, // Replace with the actual user ID or retrieve it from the logged-in user
      workerId: 0,
      createdAt: '',
      updatedAt: ''
    };

    this.notificationService.createNotificationForUser(newNotification,this.user.id).subscribe(
        () => {
          console.log('Notification created successfully.');
        },
        (error) => {
          console.error('Error creating notification', error);
        }
    );
  }
  
  private resetForm(): void {
    this.addPartnerForm.reset();
  }
  goBack() {
    this.router.navigate(['/list-partner']);
  }
}