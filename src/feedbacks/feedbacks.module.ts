import { Module } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { FeedbacksController } from './feedbacks.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { User } from 'src/users/entities/user.entity';
import { Mechanic } from 'src/mechanics/entities/mechanic.entity';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Feedback, User, Mechanic]),
    CaslModule,
  ],
  controllers: [FeedbacksController],
  providers: [FeedbacksService],
})
export class FeedbacksModule {}
