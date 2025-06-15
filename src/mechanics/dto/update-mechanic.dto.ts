import { PartialType } from '@nestjs/mapped-types';
import { CreateMechanicDto } from './create-mechanic.dto';
import { IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMechanicDto extends PartialType(CreateMechanicDto) {
  @ApiProperty({
    description: 'The name of the mechanic',
    example: 'John Doe',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'The email of the mechanic',
    example: 'john@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'The phone number of the mechanic',
    example: '+1234567890',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'The location of the mechanic',
    example: '123 Main St, City',
    required: false,
  })
  location?: string;

  @ApiProperty({
    description: 'The approval status of the mechanic',
    example: 'active',
    enum: ['active', 'inactive'],
    required: false,
  })
  approved?: 'active' | 'inactive';

  @ApiProperty({
    description: 'The ID of the user associated with the mechanic',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  user?: number;
}
