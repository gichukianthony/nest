import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description:
      'The email address associated with the account. A password reset link will be sent to this email address.',
    example: 'john.doe@example.com',
    required: true,
    type: String,
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
