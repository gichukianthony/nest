import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AtStrategy } from './strategies/at.strategy';
import { RfStrategy } from './strategies/rt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AtGuard } from './guards/at.guard';
import { RolesGuard } from './guards/roles.guard';
import { MailModule } from '../mails/mail.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          ),
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt-at' }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RfStrategy, AtGuard, RolesGuard],
  exports: [AtGuard, RolesGuard],
})
export class AuthModule {}
