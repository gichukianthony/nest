import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['user', 'admin'])
  role: 'user' | 'admin' = 'user';
}
