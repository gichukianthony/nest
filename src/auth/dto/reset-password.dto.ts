import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description:
      'The reset token received in the email when you request a password reset',
    example: 'eaef06aee414ba9b8a6d8abfac67b7758db88195be8e619a6bae7cbe605b4480',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description:
      'The new password for your account. Must be at least 6 characters long.',
    example: 'newpassword123',
    required: true,
    type: String,
    minLength: 6,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
