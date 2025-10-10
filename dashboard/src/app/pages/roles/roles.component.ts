import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RolesService } from 'src/app/core/services/roles.service';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';

export interface Role {
  id?: number;
  name: string;
  permissions: { resource: string; actions: string[] }[];
}

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  selectedRole: Role | null = null;

  modalRef?: BsModalRef;
  rejectId: number | null = null;
  isLoading = false;

  title = 'Gestion des Rôles';

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Rôles', active: true }
  ];

  addRoleForm: FormGroup;
  editRoleForm: FormGroup;
  errorMessage: string | null = null;

  readonly resources = [
    { value: 'users', label: 'Utilisateurs' },
    { value: 'roles', label: 'Rôles' },
    { value: 'partners', label: 'Partenaires' },
    { value: 'settings', label: 'Paramètres' },
    { value: 'products', label: 'Produits' },
    { value: 'project', label: 'Projet' },
    { value: 'orders', label: 'Commandes' },
    { value: 'cahier_des_charges', label: 'Cahier des charges' },
    { value: 'cdc_files', label: 'Fichiers CDC' },
    { value: 'devis', label: 'Devis' },
    { value: 'inventory', label: 'Stock' },
    { value: 'quality', label: 'Qualité' },
    { value: 'production', label: 'Production' },
    { value: 'logistics', label: 'Logistique' },
    { value: 'hr', label: 'RH' },
    { value: 'finance', label: 'Finance' },
    { value: 'method', label: 'Méthode' },
    { value: 'audit_logs', label: "Logs d'audit" },
    { value: 'sessions', label: 'Sessions' },
    { value: 'reclamation', label: 'Réclamations' },
    { value: 'notification', label: 'Notifications' },
    { value: 'workflow_discussions', label: 'Discussions workflow' },
    { value: 'workflow_messages', label: 'Messages workflow' },
    { value: 'email', label: 'Email' }
  ];

  readonly actions = [
    { value: 'create', label: 'Créer' },
    { value: 'read', label: 'Lire' },
    { value: 'update', label: 'Mettre à jour' },
    { value: 'delete', label: 'Supprimer' },
    { value: 'manage', label: 'Gérer (tous droits)' },
    { value: 'approve', label: 'Approuver' },
    { value: 'export', label: 'Exporter' },
    { value: 'import', label: 'Importer' },
    { value: 'assign', label: 'Assigner' }
  ];

  @ViewChild('addModal', { static: false }) addModal?: TemplateRef<any>;
  @ViewChild('editModal', { static: false }) editModal?: TemplateRef<any>;
  @ViewChild('showModal', { static: false }) showModal?: TemplateRef<any>;
  @ViewChild('deleteModal', { static: false }) deleteModal?: TemplateRef<any>;

  constructor(
    private rolesService: RolesService,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {
    this.addRoleForm = this.fb.group({
      type: ['employee', Validators.required],
      name: ['', Validators.required],
      copyFromRoleId: [null],
      permissions: this.fb.array([])
    });

    this.editRoleForm = this.fb.group({
      id: [''],
      type: ['', Validators.required],
      name: ['', Validators.required],
      permissions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.rolesService.findAll().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => this.roles = data,
      error: (error) => {
        console.error('Erreur lors du chargement des rôles', error);
        this.errorMessage = error.message || 'Erreur lors du chargement des rôles. Veuillez réessayer.';
      }
    });
  }

  get addPermissions(): FormArray {
    return this.addRoleForm.get('permissions') as FormArray;
  }

  get editPermissions(): FormArray {
    return this.editRoleForm.get('permissions') as FormArray;
  }

  addPermission(type: 'add' | 'edit'): void {
    const permArray = type === 'add' ? this.addPermissions : this.editPermissions;
    const usedResources = permArray.controls.map(control => control.get('resource')?.value);
    const availableResources = this.resources.filter(resource => !usedResources.includes(resource.value));

    if (availableResources.length === 0) {
      Swal.fire('Info', 'Toutes les ressources ont déjà été ajoutées.', 'info');
      return;
    }

    const group = this.fb.group({
      resource: [availableResources[0].value, Validators.required],
      actions: [[]]
    });
    permArray.push(group);
  }

  getAvailableResources(index: number, type: 'add' | 'edit'): any[] {
    const permArray = type === 'add' ? this.addPermissions : this.editPermissions;
    const currentResource = permArray.at(index).get('resource')?.value;
    const usedResources = permArray.controls
      .map((control, i) => (i !== index ? control.get('resource')?.value : null))
      .filter(res => res !== null);

    if (permArray.length <= 1) {
      return this.resources;
    }

    return this.resources.filter(res => !usedResources.includes(res.value) || res.value === currentResource);
  }

  removePermission(index: number, type: 'add' | 'edit'): void {
    if (type === 'add') {
      this.addPermissions.removeAt(index);
    } else {
      this.editPermissions.removeAt(index);
    }
  }

  onActionToggle(index: number, action: string, type: 'add' | 'edit'): void {
    const permArray = type === 'add' ? this.addPermissions : this.editPermissions;
    const actionsControl = permArray.at(index).get('actions');
    let actions: string[] = actionsControl?.value || [];

    if (actions.includes(action)) {
      actions = actions.filter(a => a !== action);
    } else {
      actions.push(action);
    }

    actionsControl?.setValue(actions);
  }

  // CORRECTION : Méthode améliorée pour copier les permissions
  copyPermissionsFromRole(): void {
    const roleId = this.addRoleForm.get('copyFromRoleId')?.value;
    
    if (!roleId) {
      Swal.fire('Info', 'Veuillez sélectionner un rôle à copier.', 'info');
      return;
    }

    const roleToCopy = this.roles.find(role => role.id === Number(roleId));
    
    if (!roleToCopy) {
      Swal.fire('Erreur', 'Rôle non trouvé.', 'error');
      return;
    }

    // CORRECTION : Vider le FormArray correctement
    this.clearPermissions('add');

    // CORRECTION : Copier les permissions avec validation des ressources
    if (roleToCopy.permissions && roleToCopy.permissions.length > 0) {
      roleToCopy.permissions.forEach(permission => {
        // Vérifier que la ressource existe dans notre liste
        const validResource = this.resources.find(r => r.value === permission.resource);
        if (validResource) {
          const group = this.fb.group({
            resource: [permission.resource, Validators.required],
            actions: [permission.actions || []]
          });
          this.addPermissions.push(group);
        } else {
          console.warn(`Ressource non valide ignorée: ${permission.resource}`);
        }
      });
      
      Swal.fire('Succès', `Permissions copiées depuis le rôle "${roleToCopy.name}"`, 'success');
    } else {
      Swal.fire('Info', `Le rôle "${roleToCopy.name}" n'a aucune permission à copier.`, 'info');
    }
  }

  // NOUVELLE MÉTHODE : Vider les permissions proprement
  clearPermissions(type: 'add' | 'edit'): void {
    const permArray = type === 'add' ? this.addPermissions : this.editPermissions;
    while (permArray.length !== 0) {
      permArray.removeAt(0);
    }
  }

  onCopyRoleChange(): void {
    const roleId = this.addRoleForm.get('copyFromRoleId')?.value;
    
    if (roleId) {
      setTimeout(() => {
        this.copyPermissionsFromRole();
      });
    }
  }

  openAddModal(template: TemplateRef<any>): void {
    this.addRoleForm.reset({
      type: 'employee',
      name: '',
      copyFromRoleId: null
    });
    
    this.clearPermissions('add');
    this.addPermission('add');
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  openEditModal(role: Role, template: TemplateRef<any>): void {
    this.editRoleForm.reset();
    this.clearPermissions('edit');

    const isClient = role.name.toUpperCase().startsWith('CLIENT');
    const type = isClient ? 'client' : 'employee';
    const name = isClient ? role.name.substring(6) : role.name;

    this.editRoleForm.patchValue({
      id: role.id,
      type,
      name
    });

    if (role.permissions && role.permissions.length > 0) {
      role.permissions.forEach(p => {
        // Validation des ressources lors du chargement pour l'édition
        const validResource = this.resources.find(r => r.value === p.resource);
        if (validResource) {
          this.editPermissions.push(this.fb.group({
            resource: [p.resource, Validators.required],
            actions: [p.actions || []]
          }));
        }
      });
    }

    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  openShowModal(role: Role, template: TemplateRef<any>): void {
    this.selectedRole = role;
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  // CORRECTION : Méthode refaite pour valider les données avant envoi
  private buildRoleFromForm(formValue: any): any {
    let roleName = formValue.name;
    if (formValue.type === 'client' && !roleName.toUpperCase().startsWith('CLIENT')) {
      roleName = 'CLIENT ' + roleName;
    }

    // CORRECTION : Filtrer et valider les permissions avant envoi
    const permissions = formValue.permissions
      .map((p: any) => ({
        resource: p.resource,
        actions: p.actions || []
      }))
      .filter((p: any) => {
        // Filtrer seulement les permissions avec des ressources valides
        const isValid = this.resources.some(r => r.value === p.resource);
        if (!isValid) {
          console.warn(`Permission avec ressource invalide ignorée: ${p.resource}`);
        }
        return isValid;
      });

    const roleData: any = {
      name: roleName,
      permissions: permissions
    };

    if (formValue.id) {
      roleData.id = formValue.id;
    }

    console.log('Rôle construit pour envoi:', roleData);
    return roleData;
  }

  // CORRECTION : Méthode pour valider le formulaire avant soumission
  validateFormBeforeSubmit(): boolean {
    // Vérifier que toutes les permissions ont des ressources valides
    const invalidPermissions = this.addPermissions.controls.filter(control => {
      const resource = control.get('resource')?.value;
      return !this.resources.some(r => r.value === resource);
    });

    if (invalidPermissions.length > 0) {
      Swal.fire('Erreur', 'Certaines permissions ont des ressources invalides. Veuillez les corriger.', 'error');
      return false;
    }

    return true;
  }

  submitAddRole(): void {
    if (this.addRoleForm.invalid) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    // CORRECTION : Validation supplémentaire des ressources
    if (!this.validateFormBeforeSubmit()) {
      return;
    }

    const newRole = this.buildRoleFromForm(this.addRoleForm.value);
    console.log('Données envoyées au serveur:', JSON.stringify(newRole, null, 2));

    this.errorMessage = null;
    this.isLoading = true;
    
    this.rolesService.create(newRole).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        console.log('Réponse du serveur:', response);
        Swal.fire('Succès', 'Rôle ajouté avec succès', 'success');
        this.modalRef?.hide();
        this.loadRoles();
      },
      error: (error) => {
        console.error('Erreur détaillée ajout rôle:', error);
        this.errorMessage = error.message || 'Erreur lors de l\'ajout du rôle';
        Swal.fire('Erreur', this.errorMessage, 'error');
      }
    });
  }

  submitEditRole(): void {
    if (this.editRoleForm.invalid) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    // CORRECTION : Validation supplémentaire des ressources
    if (!this.validateFormBeforeSubmit()) {
      return;
    }

    const formValue = this.editRoleForm.value;
    const updatedRole = this.buildRoleFromForm(formValue);

    const payload = {
      name: updatedRole.name,
      permissions: updatedRole.permissions
    };

    console.log('Données d\'édition envoyées:', JSON.stringify(payload, null, 2));

    this.isLoading = true;
    this.errorMessage = null;

    this.rolesService.update(updatedRole.id, payload).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        console.log('Réponse édition:', response);
        Swal.fire('Succès', 'Rôle modifié avec succès', 'success');
        this.modalRef?.hide();
        this.loadRoles();
      },
      error: (error) => {
        console.error('Erreur détaillée édition rôle:', error);
        this.errorMessage = error.message || 'Erreur lors de la modification du rôle';
        Swal.fire('Erreur', this.errorMessage, 'error');
      }
    });
  }

  confirmDelete(): void {
    if (this.rejectId === null) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.rolesService.remove(this.rejectId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        Swal.fire('Supprimé', 'Rôle supprimé avec succès', 'success');
        this.modalRef?.hide();
        this.loadRoles();
      },
      error: (error) => {
        console.error('Erreur suppression:', error);
        this.errorMessage = error.message || 'Erreur lors de la suppression du rôle';
        Swal.fire('Erreur', this.errorMessage, 'error');
      }
    });
  }
}