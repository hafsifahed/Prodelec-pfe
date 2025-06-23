import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PartnerStatus } from '../../project/enum/partner-status.enum';
import { User } from '../../users/entities/users.entity';

@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  tel: string;

    @Column({
      type: 'enum',
      enum: PartnerStatus,
      default: PartnerStatus.ACTIVE,
    })
    partnerStatus: PartnerStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, user => user.partner)
  users: User[];
}
