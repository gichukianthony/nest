import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToOne,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Relation,
  JoinColumn,
} from 'typeorm';
import { Mechanic } from 'src/mechanics/entities/mechanic.entity';
import { ServiceCategory } from './service-category.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  duration: number; // Duration in minutes

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  // Many-to-Many relationship with mechanics
  @ManyToMany(() => Mechanic, (mechanic) => mechanic.services)
  @JoinTable({
    name: 'mechanic_services',
    joinColumn: {
      name: 'service_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'mechanic_id',
      referencedColumnName: 'id',
    },
  })
  mechanics: Relation<Mechanic[]>;

  // One-to-One relationship with service category
  @OneToOne(() => ServiceCategory, (category) => category.service)
  @JoinColumn({ name: 'category_id' })
  category: Relation<ServiceCategory>;
}
