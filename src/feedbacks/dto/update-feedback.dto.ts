import { PartialType } from '@nestjs/mapped-types';
import { CreateFeedbackDto } from './create-feedback.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {
  @ApiProperty({
    description: 'The comment for the feedback',
    example: 'Great service! Very professional and timely.',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    description: 'The rating for the feedback (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: 'The ID of the user giving the feedback',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  user?: number;

  @ApiProperty({
    description: 'The ID of the mechanic receiving the feedback',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  mechanic?: number;
}
