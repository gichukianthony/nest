import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
    required: true,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'The role of the user', example: 'user' })
  @IsEnum(['user', 'admin'])
  role: 'user' | 'admin' = 'user';
}
