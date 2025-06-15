import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './create-service.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiProperty({
    description: 'The name of the service',
    example: 'Oil Change',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'The description of the service',
    example: 'Complete oil change service including filter replacement',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'The price of the service',
    example: 49.99,
    minimum: 0,
    required: false,
  })
  price?: number;

  @ApiProperty({
    description: 'The duration of the service in minutes',
    example: 60,
    minimum: 1,
    required: false,
  })
  duration?: number;

  @ApiProperty({
    description: 'Whether the service is currently available',
    example: true,
    required: false,
  })
  isAvailable?: boolean;

  @ApiProperty({
    description: 'The ID of the service category',
    example: 1,
    required: false,
  })
  categoryId?: number;

  @ApiProperty({
    description: 'Array of mechanic IDs who can perform this service',
    example: [1, 2, 3],
    required: false,
    type: [Number],
  })
  mechanicIds?: number[];
}
