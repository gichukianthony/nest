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
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MECHANIC = 'mechanic',
  SUPER_ADMIN = 'super_admin',
}
@Entity()
export class User {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 1,
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
    type: String,
    minLength: 2,
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    type: String,
    format: 'email',
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @ApiProperty({
    description: 'The hashed password of the user',
    example: '$2b$10$abcdefghijklmnopqrstuv',
    type: String,
    writeOnly: true,
  })
  @Column({ type: 'varchar', length: 100 })
  password: string;

  @ApiProperty({
    description: 'The role of the user in the system',
    example: 'user',
    enum: Role,
    default: Role.USER,
  })
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+1234567890',
    type: String,
    required: false,
    maxLength: 20,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @ApiProperty({
    description: 'The physical address of the user',
    example: '123 Main St, City, Country',
    type: String,
    required: false,
    maxLength: 200,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  address: string;

  @ApiProperty({
    description: 'The hashed refresh token for JWT authentication',
    type: String,
    required: false,
    writeOnly: true,
  })
  @Column({ type: 'text', nullable: true, default: null })
  hashedRefreshToken: string | null;

  @ApiProperty({
    description: 'The date when the user was created',
    example: '2024-01-01T00:00:00Z',
    type: Date,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the user was last updated',
    example: '2024-01-01T00:00:00Z',
    type: Date,
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'The feedbacks submitted by the user',
    type: [Feedback],
    required: false,
  })
  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Relation<Feedback[]>;

  @ApiProperty({
    description: 'The mechanics associated with the user',
    type: [Mechanic],
    required: false,
  })
  @OneToMany(() => Mechanic, (mechanic) => mechanic.user)
  mechanics: Relation<Mechanic[]>;
}
