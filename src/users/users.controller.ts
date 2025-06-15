import {
  Controller,
  Query,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Patch,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role, User } from './entities/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AtGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Register a new user',
    description: 'This endpoint allows public registration of new users.',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user data' })
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return await this.usersService.create(createUserDto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieve a list of all registered users. Restricted to admin roles.',
  })
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  async findAll(): Promise<Omit<User, 'password' | 'hashedRefreshToken'>[]> {
    return await this.usersService.findAll();
  }
  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Search users',
    description: 'Search for users by a query string.',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search term for user lookup',
    type: String,
    example: 'john',
  })
  @ApiResponse({ status: 200, description: 'Matching users returned' })
  @ApiResponse({ status: 400, description: 'Query parameter is required' })
  async search(@Query('query') query: string): Promise<any[]> {
    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }
    return await this.usersService.searchUser(query);
  }
  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a user using their ID.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the user to retrieve',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Omit<User, 'password' | 'hashedRefreshToken'>> {
    return await this.usersService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a user by ID. Restricted to admin roles.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the user to delete',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User with ID 1 removed successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: `User with ID ${id} removed successfully` };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
    description:
      "Update a user's information by ID. Restricted to admin roles.",
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'User ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    return await this.usersService.update(id, updateUserDto);
  }
}
