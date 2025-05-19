# Dashboard

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.10.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


# Roles, Actions, and Resources

## Overview

This project uses a **Role-Based Access Control (RBAC)** system to manage user permissions. The RBAC model defines what actions a user can perform on different resources, depending on their assigned role.

---

## Concepts

### 1. Roles

A **Role** is a collection of permissions assigned to a user. Roles are typically based on job functions or responsibilities (e.g., `ADMIN`, `CLIENT_USER`, `PROCESS_RH`). Each role is associated with a set of allowed actions on specific resources.

**Examples:**
- `ADMIN`
- `SUBADMIN`
- `CLIENT_ADMIN`
- `CLIENT_USER`
- `PROCESS_QUALITY`
- `PROCESS_DESIGN`
- `PROCESS_METHOD`
- `PROCESS_PRODUCTION`
- `PROCESS_LOGISTICS`
- `PROCESS_DAF`
- `PROCESS_RH`

---

### 2. Actions

An **Action** defines what can be done on a resource. Typical actions include:

| Action   | Description                  |
|----------|------------------------------|
| `read`   | View or retrieve data        |
| `create` | Add new data                 |
| `update` | Modify existing data         |
| `delete` | Remove data                  |
| `manage` | Full control (all actions)   |
| `export` | Export data                  |
| `import` | Import data                  |
| `approve`| Approve items/processes      |
| `assign` | Assign resources/roles       |

---

### 3. Resources

A **Resource** is any domain entity or module in the system that can be managed or accessed. Examples include:

| Resource      | Description                      |
|---------------|----------------------------------|
| `users`       | User accounts                    |
| `roles`       | User roles and permissions       |
| `partners`    | Partner companies/entities       |
| `products`    | Product catalog                  |
| `orders`      | Orders and transactions          |
| `inventory`   | Inventory management             |
| `quality`     | Quality management processes     |
| `production`  | Production processes             |
| `logistics`   | Logistics and shipping           |
| `finance`     | Financial data                   |
| `hr`          | Human resources                  |
| `settings`    | Application settings             |
| `sessions`    | User sessions                    |
| ...           | (Extend as needed)               |

---

## Example: Role Permissions Structure

A role’s permissions are defined as an array of objects, each specifying a resource and the allowed actions:

{
"name": "CLIENT_ADMIN",
"permissions": [
{
"resource": "users",
"actions": ["create", "read", "update"]
},
{
"resource": "products",
"actions": ["read", "export"]
}
]
}


---

## How It Works

- **Each user** is assigned a role.
- **Each role** defines what actions can be performed on which resources.
- **When a user requests an operation**, the system checks if their role allows the requested action on the target resource.

---

## Extending

- **Add new roles** by defining their name and permissions in the roles management module.
- **Add new resources** by updating the `Resource` enum.
- **Add new actions** by updating the `Action` enum.

---

## Developer Notes

- All permission checks are enforced via backend guards and decorators.
- The frontend UI for role management allows admins to create, view, update, and delete roles and their permissions.
- For advanced needs, you can add custom actions or resources as your business grows.

---

**For more details, see the code in:**  
- `src/roles/enums/roles.enum.ts`
- `src/roles/enums/action.enum.ts`
- `src/roles/enums/resource.enum.ts`
- `src/roles/entities/role.entity.ts`
