import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './loger.middleware';
import { MechanicsModule } from './mechanics/mechanics.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { ServicesModule } from './services/services.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { LogsModule } from './logs/logs.module';
import { RateLimiterModule } from './rate-limiter/rate-limiter.module';
import { RateLimiterMiddleware } from './rate-limiter/rate-limiter.middleware';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { CacheableMemory, Keyv } from 'cacheable';
import { createKeyv } from '@keyv/redis';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    MechanicsModule,
    FeedbacksModule,
    ServicesModule,
    LogsModule,
    RateLimiterModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        ttl: 60000,
        stores: [
          new Keyv({
            store: new CacheableMemory({ ttl: 30000, lruSize: 5000 }),
          }),
          createKeyv(
            configService.getOrThrow<string>('REDIS_URL') ||
              'redis://localhost:6379',
          ),
        ],
      }),
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, RateLimiterMiddleware).forRoutes('*');
  }
}
