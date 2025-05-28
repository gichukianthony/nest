import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { MechanicsService } from './mechanics.service';
import { CreateMechanicDto } from './dto/create-mechanic.dto';
import { UpdateMechanicDto } from './dto/update-mechanic.dto';

@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Post()
  create(@Body() createMechanicDto: CreateMechanicDto) {
    return this.mechanicsService.create(createMechanicDto);
  }

  @Get()
  findAll() {
    return this.mechanicsService.findAll();
  }
  @Get('search')
  searchMechanic(@Param('query') query: string): CreateMechanicDto[] {
    if (!query) {
      throw new NotFoundException('Query parameter is required');
    }
    return this.mechanicsService.searchMechanics(query.toLowerCase());
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): CreateMechanicDto | string {
    return this.mechanicsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMechanicDto: UpdateMechanicDto,
  ) {
    return this.mechanicsService.update(+id, updateMechanicDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    const mechanic = this.mechanicsService.findOne(id);
    if (!mechanic) {
      throw new NotFoundException(`Mechanic with ID ${id} not found`);
    }
    return this.mechanicsService.remove(id);
  }
}
