import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  Relation,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
import { User } from 'src/users/entities/user.entity';
import { Service } from 'src/services/entities/service.entity';

@Entity()
export class Mechanic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
  })
  approved: 'active' | 'inactive';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.mechanics, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' }) // This makes sure userId is the foreign key column
  user: Relation<User>;

  @OneToMany(() => Feedback, (feedback) => feedback.mechanic)
  feedbacks: Relation<Feedback[]>;

  // Many-to-Many relationship with services
  @ManyToMany(() => Service, (service) => service.mechanics)
  services: Relation<Service[]>;
}
