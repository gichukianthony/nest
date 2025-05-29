import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  IsInt,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  duration: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber({}, { each: true })
  @IsOptional()
  mechanicIds?: number[];
}
