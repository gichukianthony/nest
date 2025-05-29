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

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Relation<Feedback[]>;

  @OneToMany(() => Mechanic, (mechanic) => mechanic.user)
  mechanics: Relation<Mechanic[]>;
}
