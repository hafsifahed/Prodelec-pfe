import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
  
  @Entity('user_session')
  export class UserSession {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    usermail: string;
  
    @ManyToOne(() => User, user => user.sessions, { eager: false })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @Column({ type: 'timestamp' })
    sessionStart: Date;
  
    @Column({ type: 'timestamp', nullable: true })
    sessionEnd: Date;
  
    @Column()
    ipAddress: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  