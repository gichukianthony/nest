import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
import { Mechanic } from 'src/mechanics/entities/mechanic.entity';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MECHANIC = 'mechanic',
  SUPER_ADMIN = 'super_admin',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address: string;
  @Column({ type: 'text', nullable: true, default: null })
  hashedRefreshToken: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Relation<Feedback[]>;

  @OneToMany(() => Mechanic, (mechanic) => mechanic.user)
  mechanics: Relation<Mechanic[]>;
}
