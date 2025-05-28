import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './loger.middleware';
import { MechanicsModule } from './mechanics/mechanics.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    UsersModule,
    MechanicsModule,
    FeedbacksModule,
    ConfigModule.forRoot({
      isGlobal: true, // Make the module global
      envFilePath: '.env', // Path to the environment file
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consume: MiddlewareConsumer) {
    consume.apply(LoggerMiddleware).forRoutes('*'); // Apply the logger middleware to all routes
  }
}
