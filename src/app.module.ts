import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './loger.middleware';
@Module({
  imports: [UsersModule],
})
export class AppModule implements NestModule {
  configure(consume: MiddlewareConsumer) {
    consume.apply(LoggerMiddleware).forRoutes('*'); // Apply the logger middleware to all routes
  }
}
