import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.feedbacks', 'feedbacks')
      .getMany();
  }

  async searchUser(query: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.name) LIKE :query', {
        query: `%${query.toLowerCase()}%`,
      })
      .orWhere('LOWER(user.email) LIKE :query', {
        query: `%${query.toLowerCase()}%`,
      })
      .leftJoinAndSelect('user.feedbacks', 'feedbacks')
      .getMany();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.feedbacks', 'feedbacks')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<string> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return `User with ID ${id} removed successfully`;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.feedbacks', 'feedbacks')
      .where('user.email = :email', { email })
      .getOne();
  }
}
