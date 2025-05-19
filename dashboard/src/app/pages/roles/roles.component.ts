import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role, RolesService } from 'src/app/core/services/roles.service';

declare var window: any; // For Bootstrap modals

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  selectedRole: Role | null = null;

  addRoleForm: FormGroup;
  editRoleForm: FormGroup;

  // Bootstrap modal references
  addModal: any;
  showModal: any;
  editModal: any;

  constructor(
    private rolesService: RolesService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.initForms();

    // Initialize Bootstrap modals (if using Bootstrap 5)
    setTimeout(() => {
      this.addModal = new window.bootstrap.Modal(document.getElementById('addRoleModal'));
      this.showModal = new window.bootstrap.Modal(document.getElementById('showRoleModal'));
      this.editModal = new window.bootstrap.Modal(document.getElementById('editRoleModal'));
    }, 0);
  }

  loadRoles() {
    this.rolesService.findAll().subscribe(roles => this.roles = roles);
  }

  initForms() {
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

  // Permissions FormArray getters for template
  get addPermissionsArray(): FormArray {
    return this.addRoleForm.get('permissions') as FormArray;
  }
  get editPermissionsArray(): FormArray {
    return this.editRoleForm.get('permissions') as FormArray;
  }

  addPermission(type: 'add' | 'edit') {
    const permGroup = this.fb.group({
      resource: ['', Validators.required],
      actions: ['', Validators.required] // comma-separated string, will split on submit
    });
    if (type === 'add') {
      this.addPermissionsArray.push(permGroup);
    } else {
      this.editPermissionsArray.push(permGroup);
    }
  }

  removePermission(index: number, type: 'add' | 'edit') {
    if (type === 'add') {
      this.addPermissionsArray.removeAt(index);
    } else {
      this.editPermissionsArray.removeAt(index);
    }
  }

  // Modal openers
  openAddModal() {
    this.addRoleForm.reset();
    this.addPermissionsArray.clear();
    this.addPermission('add'); // Start with one permission
    this.addModal.show();
  }

  openShowModal(role: Role) {
    this.selectedRole = role;
    this.showModal.show();
  }

  openEditModal(role: Role) {
    this.editRoleForm.reset();
    this.editPermissionsArray.clear();
    this.editRoleForm.patchValue({ id: role.id, name: role.name });
    // Populate permissions
    role.permissions.forEach(perm => {
      this.editPermissionsArray.push(
        this.fb.group({
          resource: [perm.resource, Validators.required],
          actions: [perm.actions.join(','), Validators.required]
        })
      );
    });
    this.editModal.show();
  }

  // CRUD operations
  submitAddRole() {
    if (this.addRoleForm.invalid) return;
    const formValue = this.addRoleForm.value;
    const role: Role = {
      name: formValue.name,
      permissions: formValue.permissions.map(p => ({
        resource: p.resource,
        actions: p.actions.split(',').map(a => a.trim())
      }))
    };
    this.rolesService.create(role).subscribe(() => {
      this.addModal.hide();
      this.loadRoles();
    });
  }

  submitEditRole() {
    if (this.editRoleForm.invalid) return;
    const formValue = this.editRoleForm.value;
    const role: Role = {
      id: formValue.id,
      name: formValue.name,
      permissions: formValue.permissions.map(p => ({
        resource: p.resource,
        actions: p.actions.split(',').map(a => a.trim())
      }))
    };
    this.rolesService.update(role.id, role).subscribe(() => {
      this.editModal.hide();
      this.loadRoles();
    });
  }

  deleteRole(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      this.rolesService.remove(id).subscribe(() => this.loadRoles());
    }
  }
}
