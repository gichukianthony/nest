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
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Mechanic } from './entities/mechanic.entity';

@ApiTags('Mechanics')
@Controller('mechanics')
@UseGuards(AtGuard, RolesGuard)
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create a new mechanic',
    description:
      'Register a new mechanic in the system. Requires ADMIN or SUPER_ADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Mechanic created successfully',
    type: Mechanic,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async create(@Body() createMechanicDto: CreateMechanicDto) {
    return await this.mechanicsService.create(createMechanicDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all mechanics',
    description: 'Retrieve a list of all mechanics. Requires authentication.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of mechanics retrieved successfully',
    type: [Mechanic],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return await this.mechanicsService.findAll(page, limit);
  }

  @Get('search')
  async search(@Query('query') query: string) {
    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }
    return await this.mechanicsService.searchMechanics(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get mechanic by ID',
    description:
      'Retrieve a specific mechanic by their ID. Requires authentication.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the mechanic to retrieve',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Mechanic found',
    type: Mechanic,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Mechanic not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.mechanicsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update a mechanic',
    description:
      "Update a mechanic's information by their ID. Requires ADMIN or SUPER_ADMIN role.",
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the mechanic to update',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Mechanic updated successfully',
    type: Mechanic,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Mechanic not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMechanicDto: UpdateMechanicDto,
  ) {
    return await this.mechanicsService.update(id, updateMechanicDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete a mechanic',
    description:
      'Delete a mechanic by their ID. Requires ADMIN or SUPER_ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the mechanic to delete',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Mechanic deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Mechanic with ID 1 removed successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Mechanic not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.mechanicsService.remove(id);
    return { message: `Mechanic with ID ${id} removed successfully` };
  }
}
