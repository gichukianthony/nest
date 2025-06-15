import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMechanicDto {
  @ApiProperty({
    description: 'The full name of the mechanic',
    example: 'John Smith',
    required: true,
    type: String,
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The email address of the mechanic',
    example: 'john.smith@example.com',
    required: true,
    type: String,
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The phone number of the mechanic',
    example: '+1234567890',
    required: true,
    type: String,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'The physical location/address of the mechanic',
    example: '123 Auto Repair St, City, Country',
    required: true,
    type: String,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Additional notes or information about the mechanic',
    example: 'Specializes in engine repairs and maintenance',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'The approval status of the mechanic',
    example: 'active',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  approved?: 'active' | 'inactive';

  @ApiProperty({
    description: 'The ID of the user associated with the mechanic',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  user?: number;
}
