import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Relation,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Mechanic } from 'src/mechanics/entities/mechanic.entity';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  comment!: string;

  @Column({ type: 'int' })
  rating!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @Column({ nullable: true })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user!: Relation<User>;

  @Column({ nullable: true })
  mechanicId!: number;

  @ManyToOne(() => Mechanic, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'mechanicId' })
  mechanic!: Relation<Mechanic>;
}
