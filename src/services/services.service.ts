import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { Mechanic } from 'src/mechanics/entities/mechanic.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private categoryRepository: Repository<ServiceCategory>,
    @InjectRepository(Mechanic)
    private mechanicRepository: Repository<Mechanic>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = new Service();
    service.name = createServiceDto.name;
    service.description = createServiceDto.description;
    service.price = createServiceDto.price;
    service.duration = createServiceDto.duration;
    service.isAvailable = createServiceDto.isAvailable ?? true;

    if (createServiceDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: createServiceDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${createServiceDto.categoryId} not found`,
        );
      }
      service.category = category;
    }

    if (createServiceDto.mechanicIds?.length) {
      const mechanics = await this.mechanicRepository.findByIds(
        createServiceDto.mechanicIds,
      );
      if (mechanics.length !== createServiceDto.mechanicIds.length) {
        throw new NotFoundException('One or more mechanics not found');
      }
      service.mechanics = mechanics;
    }

    return this.serviceRepository.save(service);
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    data: Service[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;
    const [services, total] = await this.serviceRepository.findAndCount({
      skip,
      take: limit,
    });

    return {
      data: services,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['category', 'mechanics'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.findOne(id);

    if (updateServiceDto.name) service.name = updateServiceDto.name;
    if (updateServiceDto.description)
      service.description = updateServiceDto.description;
    if (updateServiceDto.price) service.price = updateServiceDto.price;
    if (updateServiceDto.duration) service.duration = updateServiceDto.duration;
    if (updateServiceDto.isAvailable !== undefined)
      service.isAvailable = updateServiceDto.isAvailable;

    if (updateServiceDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateServiceDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateServiceDto.categoryId} not found`,
        );
      }
      service.category = category;
    }

    if (updateServiceDto.mechanicIds) {
      const mechanics = await this.mechanicRepository.findByIds(
        updateServiceDto.mechanicIds,
      );
      if (mechanics.length !== updateServiceDto.mechanicIds.length) {
        throw new NotFoundException('One or more mechanics not found');
      }
      service.mechanics = mechanics;
    }

    return this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<void> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
  }

  async searchServices(query: string): Promise<Service[]> {
    return this.serviceRepository
      .createQueryBuilder('service')
      .where('LOWER(service.name) LIKE :query', {
        query: `%${query.toLowerCase()}%`,
      })
      .orWhere('LOWER(service.description) LIKE :query', {
        query: `%${query.toLowerCase()}%`,
      })
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.mechanics', 'mechanics')
      .getMany();
  }

  async addMechanicToService(
    serviceId: number,
    mechanicId: number,
  ): Promise<Service> {
    const service = await this.findOne(serviceId);
    const mechanic = await this.mechanicRepository.findOne({
      where: { id: mechanicId },
    });

    if (!mechanic) {
      throw new NotFoundException(`Mechanic with ID ${mechanicId} not found`);
    }

    service.mechanics = [...(service.mechanics || []), mechanic];
    return this.serviceRepository.save(service);
  }

  async removeMechanicFromService(
    serviceId: number,
    mechanicId: number,
  ): Promise<Service> {
    const service = await this.findOne(serviceId);
    service.mechanics = service.mechanics.filter((m) => m.id !== mechanicId);
    return this.serviceRepository.save(service);
  }
}
