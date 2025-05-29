import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreateMechanicDto {
  @IsString()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  approved?: 'active' | 'inactive';

  @IsNumber()
  @IsOptional()
  user?: number;
}
