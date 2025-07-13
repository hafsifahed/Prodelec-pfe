import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RolesService } from 'src/app/core/services/roles.service';
import Swal from 'sweetalert2';

// Adapt this interface to your backend shape if needed
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
export class RolesComponent {
  roles: Role[] = [];
  selectedRole: Role | null = null;

  modalRef?: BsModalRef;
  rejectId: number | null = null;
  isLoading: boolean = false;

    title = 'Rôles'; // Ajouté pour le breadcrumb si tu en utilises un

  breadcrumbItems = [ // Ajouté pour le breadcrumb si tu en utilises un
    { label: 'Accueil', active: false },
    { label: 'Rôles', active: true }
  ];

  addRoleForm: FormGroup;
  editRoleForm: FormGroup;
 errorMessage: string | null = null;
  // Backend enums as lists
  resources = [
    { value: 'users', label: 'Utilisateurs' },
    { value: 'roles', label: 'Rôles' },
    { value: 'partners', label: 'Partenaires' },
    { value: 'settings', label: 'Paramètres' },
    { value: 'products', label: 'Produits' },
    { value: 'orders', label: 'Commandes' },
    { value: 'inventory', label: 'Stock' },
    { value: 'project', label: 'Projet' },
    { value: 'quality', label: 'Qualité' },
    { value: 'production', label: 'Production' },
    { value: 'logistics', label: 'Logistique' },
    { value: 'hr', label: 'RH' },
    { value: 'finance', label: 'Finance' },
    { value: 'method', label: 'Méthode' },
    { value: 'audit_logs', label: 'Logs d’audit' },
    { value: 'sessions', label: 'Sessions' }
  ];

  actions = [
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
      type: ['employee', Validators.required], // Ajout du type, valeur par défaut "employee"
      name: ['', Validators.required],
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
  this.rolesService.findAll().subscribe(
    (data) => { 
      this.roles = data;
      this.isLoading = false;
    },
    (error) => { 
      console.error('Error loading roles', error);
      this.errorMessage = 'Erreur lors du chargement des rôles. Veuillez réessayer.';
      this.isLoading = false;
    }
  );
}

  // FormArray helpers
  get addPermissions(): FormArray {
    return this.addRoleForm.get('permissions') as FormArray;
  }
  get editPermissions(): FormArray {
    return this.editRoleForm.get('permissions') as FormArray;
  }

  addPermission(type: 'add' | 'edit'): void {
    const group = this.fb.group({
      resource: ['', Validators.required],
      actions: [''] // Will be handled by checkboxes
    });
    if (type === 'add') {
      this.addPermissions.push(group);
    } else {
      this.editPermissions.push(group);
    }
  }

  removePermission(index: number, type: 'add' | 'edit'): void {
    if (type === 'add') {
      this.addPermissions.removeAt(index);
    } else {
      this.editPermissions.removeAt(index);
    }
  }

  // Checkbox handler for actions
  onActionToggle(index: number, action: string, type: 'add' | 'edit') {
    const permArray = type === 'add' ? this.addPermissions : this.editPermissions;
    const actionsControl = permArray.at(index).get('actions');
    let actions = actionsControl.value ? actionsControl.value.split(',').map((a: string) => a.trim()).filter(Boolean) : [];
    if (actions.includes(action)) {
      actions = actions.filter((a: string) => a !== action);
    } else {
      actions.push(action);
    }
    actionsControl.setValue(actions.join(','));
  }

  // Modal openers
  openAddModal(template: TemplateRef<any>): void {
    this.addRoleForm.reset();
    this.addPermissions.clear();
    this.addPermission('add');
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  openEditModal(role: Role, template: TemplateRef<any>): void {
  this.editRoleForm.reset();
  this.editPermissions.clear();

  // Déterminer le type selon le nom du rôle
  const isClient = role.name.toUpperCase().startsWith('CLIENT');
  const type = isClient ? 'client' : 'employee';

  // Si c'est un client, retirer le préfixe CLIENT du nom affiché dans le champ name
  const name = isClient ? role.name.substring(6).trim() : role.name;

  this.editRoleForm.patchValue({ 
    id: role.id, 
    type: type,
    name: name
  });

  role.permissions.forEach(p => {
    this.editPermissions.push(this.fb.group({
      resource: [p.resource, Validators.required],
      actions: [p.actions.join(',')]
    }));
  });

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

  // CRUD operations
submitAddRole(): void {
  if (this.addRoleForm.invalid) return;
  const formValue = this.addRoleForm.value;

  // Préfixer le nom si type = client
  let roleName = formValue.name;
  if (formValue.type === 'client' && !roleName.toUpperCase().startsWith('CLIENT')) {
    roleName = 'CLIENT ' + roleName;
  }

  const newRole: Role = {
    name: roleName,
    permissions: formValue.permissions.map((p: any) => ({
      resource: p.resource,
      actions: p.actions.split(',').map((a: string) => a.trim()).filter(Boolean)
    }))
  };

  this.errorMessage = null;
  this.rolesService.create(newRole).subscribe(
    () => {
      Swal.fire('Succès', 'Rôle ajouté avec succès', 'success');
      this.modalRef?.hide();
      this.loadRoles();
    },
    error => {
      this.errorMessage = 'Erreur lors de l\'ajout du rôle';
      Swal.fire('Erreur', this.errorMessage, 'error');
    }
  );
}



  submitEditRole(): void {
  if (this.editRoleForm.invalid) return;
  const formValue = this.editRoleForm.value;

  let roleName = formValue.name;
  if (formValue.type === 'client' && !roleName.toUpperCase().startsWith('CLIENT')) {
    roleName = 'CLIENT ' + roleName;
  }

  const updatedRole: Role = {
    id: formValue.id,
    name: roleName,
    permissions: formValue.permissions.map((p: any) => ({
      resource: p.resource,
      actions: p.actions.split(',').map((a: string) => a.trim()).filter(Boolean)
    }))
  };

  this.isLoading = true;
  this.errorMessage = null;

  this.rolesService.update(updatedRole.id, updatedRole).subscribe(
    () => {
      Swal.fire('Succès', 'Rôle modifié avec succès', 'success');
      this.modalRef?.hide();
      this.loadRoles();
    }, 
    error => {
      this.isLoading = false;
      this.errorMessage = 'Erreur lors de la modification du rôle';
      Swal.fire('Erreur', this.errorMessage, 'error');
    }
  );
}


confirmDelete(): void {
  if (this.rejectId === null) return;

  this.isLoading = true;
  this.errorMessage = null;
  
  this.rolesService.remove(this.rejectId).subscribe(
    () => {
      Swal.fire('Supprimé', 'Rôle supprimé avec succès', 'success');
      this.modalRef?.hide();
      this.loadRoles();
    }, 
    error => {
      this.isLoading = false;
      this.errorMessage = 'Erreur lors de la suppression du rôle';
      Swal.fire('Erreur', this.errorMessage, 'error');
    }
  );
}
}
