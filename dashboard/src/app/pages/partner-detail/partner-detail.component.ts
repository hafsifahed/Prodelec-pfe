import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PartnersService } from '../../core/services/partners.service';
import { Partner } from '../../core/models/partner.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-partner-detail',
  templateUrl: './partner-detail.component.html',
  styleUrls: ['./partner-detail.component.scss']
})
export class PartnerDetailComponent implements OnInit {
  partner: Partner | null = null;
  errorMessage = '';
  loading = true;
  title = 'Partenaire';
  partnerId: number;

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Partenaire', active: true }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partnersService: PartnersService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam || isNaN(+idParam)) {
        this.errorMessage = 'ID de partenaire invalide';
        this.loading = false;
        return;
      }
      this.partnerId = +idParam;
      this.loading = true;
      this.loadPartner(this.partnerId);
    });
  }

  loadPartner(id: number): void {
    if (!id) {
      this.errorMessage = 'ID partenaire invalide';
      this.loading = false;
      return;
    }

    this.partnersService.getPartnerById(id).subscribe({
      next: (partner) => {
        this.partner = partner;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du partenaire', error);
        this.errorMessage = 'Erreur lors du chargement du partenaire. Veuillez réessayer plus tard.';
        this.loading = false;
        Swal.fire('Erreur', this.errorMessage, 'error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/list-partner']);
  }
}
