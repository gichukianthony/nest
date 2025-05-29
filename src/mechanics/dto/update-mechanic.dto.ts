import { PartialType } from '@nestjs/mapped-types';
import { CreateMechanicDto } from './create-mechanic.dto';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdateMechanicDto extends PartialType(CreateMechanicDto) {
  @IsOptional()
  @IsNumber()
  user?: number;
}
