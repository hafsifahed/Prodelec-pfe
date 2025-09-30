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
    { value: 'orders', label: 'Commandes' },
    { value: 'inventory', label: 'Stock' },
    { value: 'project', label: 'Projet' },
    { value: 'quality', label: 'Qualité' },
    { value: 'production', label: 'Production' },
    { value: 'logistics', label: 'Logistique' },
    { value: 'hr', label: 'RH' },
    { value: 'finance', label: 'Finance' },
    { value: 'method', label: 'Méthode' },
    { value: 'audit_logs', label: "Logs d'audit" },
    { value: 'sessions', label: 'Sessions' }
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
    ).subscribe(
      data => this.roles = data,
      error => {
        console.error('Erreur lors du chargement des rôles', error);
        this.errorMessage = 'Erreur lors du chargement des rôles. Veuillez réessayer.';
      }
    );
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

  openAddModal(template: TemplateRef<any>): void {
    this.addRoleForm.reset({
      type: 'employee',
      name: ''
    });
    this.addPermissions.clear();
    this.addPermission('add');
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  openEditModal(role: Role, template: TemplateRef<any>): void {
    this.editRoleForm.reset();
    this.editPermissions.clear();

    const isClient = role.name.toUpperCase().startsWith('CLIENT');
    const type = isClient ? 'client' : 'employee';
    const name = isClient ? role.name.substring(6) : role.name;

    this.editRoleForm.patchValue({
      id: role.id,
      type,
      name
    });

    role.permissions.forEach(p => {
      this.editPermissions.push(this.fb.group({
        resource: [p.resource, Validators.required],
        actions: [p.actions]
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

  private buildRoleFromForm(formValue: any): Role {
    let roleName = formValue.name;
    if (formValue.type === 'client' && !roleName.toUpperCase().startsWith('CLIENT')) {
      roleName = 'CLIENT' + roleName;
    }

    const permissionsMap = new Map<string, Set<string>>();
    formValue.permissions.forEach((p: any) => {
      if (!permissionsMap.has(p.resource)) {
        permissionsMap.set(p.resource, new Set());
      }
      p.actions.forEach((action: string) => permissionsMap.get(p.resource)!.add(action));
    });

    const permissions = Array.from(permissionsMap.entries()).map(([resource, actionsSet]) => ({
      resource,
      actions: Array.from(actionsSet)
    }));

    return {
      id: formValue.id,
      name: roleName,
      permissions
    };
  }

  submitAddRole(): void {
    if (this.addRoleForm.invalid) return;

    const newRole = this.buildRoleFromForm(this.addRoleForm.value);

    this.errorMessage = null;
    this.isLoading = true;
    this.rolesService.create(newRole).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe(
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
  const updatedRole = this.buildRoleFromForm(formValue);

  // ✅ Only send name and permissions — NOT id
  const payload = {
    name: updatedRole.name,
    permissions: updatedRole.permissions
  };

  this.isLoading = true;
  this.errorMessage = null;

  this.rolesService.update(updatedRole.id!, payload).pipe(
    finalize(() => this.isLoading = false)
  ).subscribe(
    () => {
      Swal.fire('Succès', 'Rôle modifié avec succès', 'success');
      this.modalRef?.hide();
      this.loadRoles();
    },
    error => {
      console.error('Update error:', error); // 🔍 Log full error
      this.errorMessage = 'Erreur lors de la modification du rôle';
      Swal.fire('Erreur', this.errorMessage, 'error');
    }
  );
}

  confirmDelete(): void {
    if (this.rejectId === null) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.rolesService.remove(this.rejectId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe(
      () => {
        Swal.fire('Supprimé', 'Rôle supprimé avec succès', 'success');
        this.modalRef?.hide();
        this.loadRoles();
      },
      error => {
        this.errorMessage = 'Erreur lors de la suppression du rôle';
        Swal.fire('Erreur', this.errorMessage, 'error');
      }
    );
  }
}
