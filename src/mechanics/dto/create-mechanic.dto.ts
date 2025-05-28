import { IsOptional, IsString, IsEmail, IsEnum, IsInt } from 'class-validator';

export class CreateMechanicDto {
  @IsOptional()
  mechanic_id?: number;
  @IsString()
  name!: string;
  @IsEmail()
  email!: string;
  @IsInt()
  phone!: number;
  @IsString()
  location!: string;
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  approved?: 'active' | 'inactive' = 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}
