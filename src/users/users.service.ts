import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private users: CreateUserDto[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: Role.User,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'secret',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: Role.User,
    },
    {
      id: 3,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'secret',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: Role.User,
    },
  ];
  // create a new user
  create(user: CreateUserDto): CreateUserDto {
    const lastId: number | undefined =
      this.users.length > 0 ? this.users[this.users.length - 1].id : 0;
    const newUser: CreateUserDto = {
      id: (lastId ?? 0) + 1,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: user.role || Role.User, // Default to User role if not provided
    };
    this.users.push(newUser);
    return newUser;
  }

  // find all users
  findAll(): CreateUserDto[] {
    return this.users;
  }
  // search user
  searchUser(query: string): CreateUserDto[] {
    const foundUsers = this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()),
    );
    return foundUsers;
  }

  // find user by id
  findUserById(id: number): CreateUserDto | string {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // update user
  update(id: number, data: UpdateUserDto): UpdateUserDto | string {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return 'User not found';
    }
    const updatedUser = {
      ...this.users[userIndex],
      ...data,
      updatedAt: new Date(),
    };
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  // remove user
  deleteUser(id: number): string {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
      return `User with id ${id} deleted successfully`;
    }
    return `User with id ${id} not found`;
  }
}
