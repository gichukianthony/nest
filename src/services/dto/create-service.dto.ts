import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    description: 'The name of the service',
    example: 'Engine Repair',
    required: true,
    type: String,
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the service',
    example:
      'Complete engine repair and maintenance service including diagnostics, parts replacement, and testing.',
    required: true,
    type: String,
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The price of the service in the default currency',
    example: 299.99,
    required: true,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Estimated duration of the service in hours',
    example: 2.5,
    required: true,
    type: Number,
    minimum: 0.5,
  })
  @IsNumber()
  @Min(0.5)
  @IsNotEmpty()
  duration: number;

  @ApiProperty({
    description: 'Additional notes or requirements for the service',
    example: 'Please bring your vehicle maintenance history if available.',
    required: false,
    type: String,
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Whether the service is currently available',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({
    description: 'The ID of the service category',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    description: 'Array of mechanic IDs who can perform this service',
    example: [1, 2, 3],
    required: false,
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @IsOptional()
  mechanicIds?: number[];
}
