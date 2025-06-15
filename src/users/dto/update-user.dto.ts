import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
  IsOptional,
} from 'class-validator';
import { Role } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
    required: false,
    type: String,
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    required: false,
    type: String,
    format: 'email',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
    required: false,
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'The role of the user in the system',
    example: 'admin',
    required: false,
    enum: Role,
    enumName: 'Role',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+1234567890',
    required: false,
    type: String,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'The physical address of the user',
    example: '123 Main St, City, Country',
    required: false,
    type: String,
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  address?: string;
}
