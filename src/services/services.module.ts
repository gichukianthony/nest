import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service } from './entities/service.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { Mechanic } from 'src/mechanics/entities/mechanic.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceCategory, Mechanic]),
    AuthModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService, RolesGuard],
  exports: [ServicesService],
})
export class ServicesModule {}
