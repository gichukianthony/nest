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
import { Role } from './entities/user.entity';

@Controller('users')
@UseGuards(AtGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return await this.usersService.create(createUserDto);
  }
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  async findAll(): Promise<any[]> {
    return await this.usersService.findAll();
  }

  @Get('search')
  async search(@Query('query') query: string): Promise<any[]> {
    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }
    return await this.usersService.searchUser(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.usersService.findOne(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.remove(+id);
    return { message: `User with ID ${id} removed successfully` };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    return await this.usersService.update(id, updateUserDto);
  }
}
