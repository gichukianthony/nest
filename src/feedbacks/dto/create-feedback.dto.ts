import {
  IsString,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  comment: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNumber()
  @IsOptional()
  user?: number;

  @IsNumber()
  @IsOptional()
  mechanic?: number;
}
