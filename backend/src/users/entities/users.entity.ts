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
import { CahierDesCharges } from '../../cahier-des-charges/entities/cahier-des-charge.entity';
import { Devis } from '../../devis/entities/devi.entity';
import { Notification } from '../../notifications/notification.entity';
import { Order } from '../../order/entities/order.entity';
import { Partner } from '../../partners/entities/partner.entity';
import { Reclamation } from '../../reclamation/entities/reclamation.entity';
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

  @OneToMany(() => Reclamation, reclamation => reclamation.user)
reclamations: Reclamation[];

@OneToMany(() => Devis, devis => devis.user)
devis: Devis[];

@OneToMany(() => CahierDesCharges, cdc => cdc.user)
cahierDesCharges: CahierDesCharges[];

@OneToMany(() => Order, order => order.user)
  orders: Order[];

   @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
