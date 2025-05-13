export interface UpdateUserFullDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    roleId?: number;
    partnerId?: number;
    accountStatus?: 'active' | 'inactive' | 'suspended';
  }
  