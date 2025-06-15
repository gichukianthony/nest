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
    private readonly mechanicRepository: Repository<Mechanic>,
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

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    data: Mechanic[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;
    const [mechanics, total] = await this.mechanicRepository.findAndCount({
      skip,
      take: limit,
      relations: ['user'],
    });

    return {
      data: mechanics,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Mechanic> {
    const mechanic = await this.mechanicRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!mechanic) {
      throw new NotFoundException(`Mechanic with ID ${id} not found`);
    }

    return mechanic;
  }

  async update(
    id: number,
    updateMechanicDto: UpdateMechanicDto,
  ): Promise<Mechanic> {
    const mechanic = await this.findOne(id);
    Object.assign(mechanic, updateMechanicDto);
    return this.mechanicRepository.save(mechanic);
  }

  async remove(id: number): Promise<{ message: string }> {
    const mechanic = await this.findOne(id);
    await this.mechanicRepository.remove(mechanic);
    return { message: `Mechanic with ID ${id} removed successfully` };
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
