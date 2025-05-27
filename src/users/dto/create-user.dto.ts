import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsOptional()
  id?: number;
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  createdAt?: Date;

  updatedAt?: Date;

  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.User;
}
