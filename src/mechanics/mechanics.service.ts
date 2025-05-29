import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mechanic } from './entities/mechanic.entity';
import { CreateMechanicDto } from './dto/create-mechanic.dto';
import { UpdateMechanicDto } from './dto/update-mechanic.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MechanicsService {
  constructor(
    @InjectRepository(Mechanic)
    private mechanicRepository: Repository<Mechanic>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createMechanicDto: CreateMechanicDto): Promise<Mechanic> {
    const mechanic = new Mechanic();
    mechanic.name = createMechanicDto.name;

    if (createMechanicDto.email) {
      mechanic.email = createMechanicDto.email;
    }
    if (createMechanicDto.phone) {
      mechanic.phone = createMechanicDto.phone;
    }
    if (createMechanicDto.location) {
      mechanic.location = createMechanicDto.location;
    }
    mechanic.approved = createMechanicDto.approved || 'inactive';

    if (createMechanicDto.user) {
      const user = await this.userRepository.findOne({
        where: { id: createMechanicDto.user },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${createMechanicDto.user} not found`,
        );
      }
      mechanic.user = user;
    }

    return this.mechanicRepository.save(mechanic);
  }

  async findAll(user_id?: number): Promise<Mechanic[]> {
    const queryBuilder = this.mechanicRepository
      .createQueryBuilder('mechanic')
      .leftJoinAndSelect('mechanic.user', 'user')
      .leftJoinAndSelect('mechanic.feedbacks', 'feedbacks')
      .leftJoinAndSelect('feedbacks.user', 'feedbackUser')
      .leftJoinAndSelect('mechanic.services', 'services')
      .leftJoinAndSelect('services.category', 'serviceCategory');

    if (user_id) {
      queryBuilder.where('user.id = :userId', { userId: user_id });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Mechanic> {
    const mechanic = await this.mechanicRepository
      .createQueryBuilder('mechanic')
      .leftJoinAndSelect('mechanic.user', 'user')
      .leftJoinAndSelect('mechanic.feedbacks', 'feedbacks')
      .leftJoinAndSelect('feedbacks.user', 'feedbackUser')
      .leftJoinAndSelect('mechanic.services', 'services')
      .leftJoinAndSelect('services.category', 'serviceCategory')
      .where('mechanic.id = :id', { id })
      .getOne();

    if (!mechanic) {
      throw new NotFoundException(`Mechanic with ID ${id} not found`);
    }
    return mechanic;
  }

  async update(
    id: number,
    updateMechanicDto: UpdateMechanicDto,
  ): Promise<Mechanic> {
    const mechanic = await this.mechanicRepository
      .createQueryBuilder('mechanic')
      .leftJoinAndSelect('mechanic.user', 'user')
      .leftJoinAndSelect('mechanic.feedbacks', 'feedbacks')
      .leftJoinAndSelect('mechanic.services', 'services')
      .where('mechanic.id = :id', { id })
      .getOne();

    if (!mechanic) {
      throw new NotFoundException(`Mechanic with ID ${id} not found`);
    }

    if (updateMechanicDto.user) {
      const user = await this.userRepository.findOne({
        where: { id: updateMechanicDto.user },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${updateMechanicDto.user} not found`,
        );
      }
      mechanic.user = user;
    }

    if (updateMechanicDto.name) mechanic.name = updateMechanicDto.name;
    if (updateMechanicDto.email) mechanic.email = updateMechanicDto.email;
    if (updateMechanicDto.phone) mechanic.phone = updateMechanicDto.phone;
    if (updateMechanicDto.location)
      mechanic.location = updateMechanicDto.location;
    if (updateMechanicDto.approved)
      mechanic.approved = updateMechanicDto.approved;

    return this.mechanicRepository.save(mechanic);
  }

  async remove(id: number): Promise<string> {
    const mechanic = await this.mechanicRepository.findOneBy({ id });
    if (!mechanic) {
      throw new NotFoundException(`Mechanic with ID ${id} not found`);
    }
    await this.mechanicRepository.remove(mechanic);
    return `Mechanic with ID ${id} removed successfully`;
  }

  async searchMechanics(query: string): Promise<Mechanic[]> {
    return this.mechanicRepository
      .createQueryBuilder('mechanic')
      .where('LOWER(mechanic.name) LIKE :query', {
        query: `%${query.toLowerCase()}%`,
      })
      .leftJoinAndSelect('mechanic.user', 'user')
      .leftJoinAndSelect('mechanic.feedbacks', 'feedbacks')
      .leftJoinAndSelect('feedbacks.user', 'feedbackUser')
      .leftJoinAndSelect('mechanic.services', 'services')
      .leftJoinAndSelect('services.category', 'serviceCategory')
      .getMany();
  }
}
