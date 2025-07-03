import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RolesService } from 'src/app/core/services/roles.service';
import Swal from 'sweetalert2';

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

  addRoleForm: FormGroup;
  editRoleForm: FormGroup;

  resources = [
    { value: 'users', label: 'Utilisateurs' },
    { value: 'roles', label: 'Rôles' },
    { value: 'partners', label: 'Partenaires' },
    { value: 'settings', label: 'Paramètres' },
    { value: 'products', label: 'Produits' },
    { value: 'orders', label: 'Commandes' },
    { value: 'inventory', label: 'Stock' },
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
      name: ['', Validators.required],
      permissions: this.fb.array([])
    });

    this.editRoleForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      permissions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.rolesService.findAll().subscribe(
      data => this.roles = data,
      error => console.error('Error loading roles', error)
    );
  }

  get addPermissions(): FormArray {
    return this.addRoleForm.get('permissions') as FormArray;
  }

  get editPermissions(): FormArray {
    return this.editRoleForm.get('permissions') as FormArray;
  }

  addPermission(type: 'add' | 'edit'): void {
    const group = this.fb.group({
      resource: ['', Validators.required],
      actions: [''] // comma-separated string of actions
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

  onActionToggle(index: number, action: string, type: 'add' | 'edit'): void {
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

  // Prevent duplicate resource selection
  getAvailableResources(currentIndex: number, type: 'add' | 'edit'): any[] {
    const permissionsArray = type === 'add' ? this.addPermissions : this.editPermissions;
    const selectedResources = permissionsArray.controls
      .map((control, index) => (index !== currentIndex) ? control.get('resource')?.value : null)
      .filter(resource => resource !== null);
    return this.resources.filter(res => !selectedResources.includes(res.value));
  }

  openAddModal(template: TemplateRef<any>): void {
    this.addRoleForm.reset();
    this.addPermissions.clear();
    this.addPermission('add');
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  openEditModal(role: Role, template: TemplateRef<any>): void {
    this.editRoleForm.reset();
    this.editPermissions.clear();
    this.editRoleForm.patchValue({ id: role.id, name: role.name });
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

  submitAddRole(): void {
    if (this.addRoleForm.invalid) return;
    const formValue = this.addRoleForm.value;
    const newRole: Role = {
      name: formValue.name,
      permissions: formValue.permissions.map((p: any) => ({
        resource: p.resource,
        actions: p.actions.split(',').map((a: string) => a.trim()).filter(Boolean)
      }))
    };
    this.rolesService.create(newRole).subscribe(() => {
      Swal.fire('Succès', 'Rôle ajouté avec succès', 'success');
      this.modalRef?.hide();
      this.loadRoles();
    }, error => {
      Swal.fire('Erreur', 'Erreur lors de l\'ajout du rôle', 'error');
    });
  }

  submitEditRole(): void {
    if (this.editRoleForm.invalid) return;
    const formValue = this.editRoleForm.value;
    const updatedRole: Role = {
      id: formValue.id,
      name: formValue.name,
      permissions: formValue.permissions.map((p: any) => ({
        resource: p.resource,
        actions: p.actions.split(',').map((a: string) => a.trim()).filter(Boolean)
      }))
    };
    this.rolesService.update(updatedRole.id, updatedRole).subscribe(() => {
      Swal.fire('Succès', 'Rôle modifié avec succès', 'success');
      this.modalRef?.hide();
      this.loadRoles();
    }, error => {
      Swal.fire('Erreur', 'Erreur lors de la modification du rôle', 'error');
    });
  }

  confirmDelete(): void {
    if (this.rejectId === null) return;
    this.rolesService.remove(this.rejectId).subscribe(() => {
      Swal.fire('Supprimé', 'Rôle supprimé avec succès', 'success');
      this.modalRef?.hide();
      this.loadRoles();
    }, error => {
      Swal.fire('Erreur', 'Erreur lors de la suppression du rôle', 'error');
    });
  }
}
