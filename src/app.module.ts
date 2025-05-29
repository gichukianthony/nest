import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './loger.middleware';
import { MechanicsModule } from './mechanics/mechanics.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { ServicesModule } from './services/services.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { LogsModule } from './logs/logs.module';
import { RateLimiterModule } from './rate-limiter/rate-limiter.module';
import { RateLimiterMiddleware } from './rate-limiter/rate-limiter.middleware';

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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, RateLimiterMiddleware)
      .forRoutes('*');
  }
}
