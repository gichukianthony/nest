import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Service } from './entities/service.entity';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Services')
@ApiBearerAuth('JWT-auth')
@Controller('services')
@UseGuards(AtGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}
  @Public()
  @Post()
  @ApiOperation({
    summary: 'Create a new service',
    description:
      'Add a new service to the system. Requires ADMIN or SUPER_ADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
    type: Service,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async create(@Body() createServiceDto: CreateServiceDto) {
    return await this.servicesService.create(createServiceDto);
  }
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all services',
    description: 'Retrieve a list of all services. Requires authentication.',
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
    description: 'List of services retrieved successfully',
    type: [Service],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return await this.servicesService.findAll(page, limit);
  }
  @Public()
  @Get('search')
  async search(@Query('query') query: string) {
    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }
    return await this.servicesService.searchServices(query);
  }
  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get service by ID',
    description:
      'Retrieve a specific service by its ID. Requires authentication.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the service to retrieve',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Service found',
    type: Service,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.servicesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update a service',
    description:
      'Update a service by its ID. Requires ADMIN or SUPER_ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the service to update',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    type: Service,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return await this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete a service',
    description:
      'Delete a service by its ID. Requires ADMIN or SUPER_ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the service to delete',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Service deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Service with ID 1 removed successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.servicesService.remove(id);
    return { message: `Service with ID ${id} removed successfully` };
  }
  @Public()
  @Post(':serviceId/mechanics/:mechanicId')
  addMechanicToService(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Param('mechanicId', ParseIntPipe) mechanicId: number,
  ) {
    return this.servicesService.addMechanicToService(serviceId, mechanicId);
  }
  @Public()
  @Delete(':serviceId/mechanics/:mechanicId')
  removeMechanicFromService(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Param('mechanicId', ParseIntPipe) mechanicId: number,
  ) {
    return this.servicesService.removeMechanicFromService(
      serviceId,
      mechanicId,
    );
  }
}
