import {
  Controller,
  Query,
  Get,
  Post,
  Body,
  Param,
  Delete,
  NotFoundException,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { Role } from './enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): CreateUserDto {
    return this.usersService.create(createUserDto);
  }
  @Get()
  findAll(): CreateUserDto[] {
    return this.usersService.findAll();
  }
  @Get('search')
  searchUser(@Query('query') query: string): CreateUserDto[] {
    if (!query) {
      throw new NotFoundException('Query parameter is required');
    }
    return this.usersService.searchUser(query.toLowerCase());
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): CreateUserDto | string {
    return this.usersService.findUserById(id);
  }
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): string {
    const user = this.usersService.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.usersService.deleteUser(id);
    return `User with ID ${id} deleted successfully`;
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
}
