import { Module } from '@nestjs/common';
import { MechanicsService } from './mechanics.service';
import { MechanicsController } from './mechanics.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [MechanicsController],
  providers: [MechanicsService],
  imports: [DatabaseModule],
})
export class MechanicsModule {}
