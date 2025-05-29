import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { MechanicsService } from './mechanics.service';
import { CreateMechanicDto } from './dto/create-mechanic.dto';
import { UpdateMechanicDto } from './dto/update-mechanic.dto';

@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Post()
  async create(@Body() createMechanicDto: CreateMechanicDto) {
    return await this.mechanicsService.create(createMechanicDto);
  }

  @Get()
  async findAll(@Query('user_id') user_id?: number) {
    return await this.mechanicsService.findAll(user_id);
  }

  @Get('search/:query')
  async search(@Param('query') query: string) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    return await this.mechanicsService.searchMechanics(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.mechanicsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMechanicDto: UpdateMechanicDto,
  ) {
    return await this.mechanicsService.update(id, updateMechanicDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.mechanicsService.remove(id);
    return { message: `Mechanic with ID ${id} removed successfully` };
  }
}
