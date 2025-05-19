export enum Action {
  // Basic CRUD
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  
  // Special Actions
  MANAGE = 'manage', // Full control
  APPROVE = 'approve',
  EXPORT = 'export',
  IMPORT = 'import',
  ASSIGN = 'assign'
}
