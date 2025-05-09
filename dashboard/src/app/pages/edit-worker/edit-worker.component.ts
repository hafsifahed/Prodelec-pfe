import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkersService } from '../../core/services/workers.service';
import { WorkerModel } from '../../core/models/worker.models';
import Swal from 'sweetalert2';
import { WorkerEditDto } from "../../core/models/worker-edit-dto";

@Component({
  selector: 'app-edit-worker',
  templateUrl: './edit-worker.component.html',
  styleUrls: ['./edit-worker.component.scss']
})
export class EditWorkerComponent implements OnInit {
  worker: WorkerEditDto = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    workerSessions: []
  };
  errorMessage = '';
  roles: string[] = [
    'ADMIN',
    'SUBADMIN',
    'Processus Management Qualité',
    'Processus Conception ET Développement',
    'Processus Methode',
    'Processus Production',
    'Processus Logistique ET Commerciale',
    'Processus DAF'
  ];

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private workersService: WorkersService
  ) {}

  ngOnInit(): void {
    this.getWorker();
  }

  getWorker(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.workersService.getWorkerById(id).subscribe(
        (worker: WorkerModel) => {
          const processedWorker = {
            id: worker.id,
            firstName: worker.firstName,
            lastName: worker.lastName,
            email: worker.email,
            password: worker.password,
            role: worker.role,
            workerSessions: worker.workerSessions
          };
          this.worker = processedWorker;
        },
        (error: any) => {
          console.error('Erreur lors de la récupération du travailleur', error);
          this.showErrorMessage('Erreur lors de la récupération du travailleur. Veuillez réessayer plus tard.');
        }
    );
  }

  updateWorker(): void {
    this.workersService.updateWorker(this.worker.id, this.worker).subscribe(
        () => {
          Swal.fire({
            title: 'Succès!',
            text: 'Travailleur mis à jour avec succès.',
            icon: 'success'
          });
          this.router.navigate(['/list-worker']);
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du travailleur', error.toString());
          Swal.fire({
            title: 'Erreur!',
            text: 'Une erreur s\'est produite lors de la mise à jour du travailleur.',
            icon: 'error'
          });
        }
    );
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  goBack() {
    this.router.navigate(['/list-worker']);
  }
}