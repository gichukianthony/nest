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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @Public()
  async findAll(): Promise<any[]> {
    return await this.usersService.findAll();
  }

  @Get('search')
  @Public()
  async search(@Query('query') query: string): Promise<any[]> {
    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }
    return await this.usersService.searchUser(query);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.usersService.findOne(+id);
  }

  @Delete(':id')
  @Public()
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.remove(+id);
    return { message: `User with ID ${id} removed successfully` };
  }

  @Patch(':id')
  @Public()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    return await this.usersService.update(id, updateUserDto);
  }
}
