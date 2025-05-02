import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Action } from '../enums/action.enum';
import { Resource } from '../enums/resource.enum';

interface Permission {
  resource: Resource;
  actions: Action[];
}

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'json' }) // Store permissions as JSON array of Permission objects
  permissions: Permission[];

  @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
  
  @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
