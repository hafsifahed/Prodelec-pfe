import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Avis } from '../../avis/entities/avis.entity';
import { Partner } from '../../partners/entities/partner.entity';
import { Role } from '../../roles/entities/role.entity';
import { UserSession } from '../../user-session/entities/user-session.entity';
import { AccountStatus } from '../enums/account-status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @ManyToOne(() => Role, { eager: true, nullable: false })
  @JoinColumn({ name: 'roleId' }) // Optional: specify FK column name
  role: Role;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.INACTIVE,
  })
  accountStatus: AccountStatus;

  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];

  @ManyToOne(() => Partner, { eager: true, nullable: true })
  @JoinColumn({ name: 'partnerId' })
  partner: Partner;

  @OneToMany(() => Avis, avis => avis.user)
  avis: Avis[];


  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
