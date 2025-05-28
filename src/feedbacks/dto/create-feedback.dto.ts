import { IsNumber, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @IsNumber()
  feedback_id!: number;
  @IsNumber()
  user_id!: number;
  @IsString()
  comment!: string;
  @IsNumber()
  rating!: number;

  createdAt!: Date;
  updatedAt!: Date;
  @IsNumber()
  mechanic_id!: number;
}
