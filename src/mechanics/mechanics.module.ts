import { Module } from '@nestjs/common';
import { MechanicsService } from './mechanics.service';
import { MechanicsController } from './mechanics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mechanic } from './entities/mechanic.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mechanic, User])],
  controllers: [MechanicsController],
  providers: [MechanicsService],
})
export class MechanicsModule {}
