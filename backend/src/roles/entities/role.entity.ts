import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Action } from '../enums/action.enum';
import { Resource } from '../enums/resource.enum';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'json' })
  permissions: Array<{
    resource: Resource;
    actions: Action[];
  }>;

  @Column({ default: false })
  isSystemRole: boolean; // For pre-defined roles like ADMIN

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
