import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMechanicDto } from './dto/create-mechanic.dto';
import { UpdateMechanicDto } from './dto/update-mechanic.dto';

@Injectable()
export class MechanicsService {
  private mechanics: CreateMechanicDto[] = [
    {
      mechanic_id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: 1234567890,
      location: 'New York',
      approved: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      mechanic_id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: 9876543210,
      location: 'Los Angeles',
      approved: 'inactive',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  // Create a new mechanic
  create(mechanic: CreateMechanicDto): CreateMechanicDto {
    const lastId: number | undefined =
      this.mechanics.length > 0
        ? this.mechanics[this.mechanics.length - 1].mechanic_id
        : 0;
    const newMechanic: CreateMechanicDto = {
      mechanic_id: (lastId ?? 0) + 1,
      name: mechanic.name,
      email: mechanic.email,
      phone: mechanic.phone,
      location: mechanic.location,
      approved: mechanic.approved || 'inactive',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mechanics.push(newMechanic);
    return newMechanic;
  }
  // Find all mechanics
  findAll(): CreateMechanicDto[] {
    return this.mechanics;
  }
  // Find a mechanic by ID
  findOne(mechanic_id: number): CreateMechanicDto {
    const mechanic = this.mechanics.find((m) => m.mechanic_id === mechanic_id);
    if (!mechanic) {
      throw new NotFoundException(`Mechanic with ID ${mechanic_id} not found`);
    }
    return mechanic;
  }
  // Update a mechanic
  update(
    mechanic_id: number,
    updateMechanicDto: UpdateMechanicDto,
  ): CreateMechanicDto {
    const mechanicIndex = this.mechanics.findIndex(
      (m) => m.mechanic_id === mechanic_id,
    );
    if (mechanicIndex === -1) {
      throw new NotFoundException(`Mechanic with ID ${mechanic_id} not found`);
    }
    const updatedMechanic: CreateMechanicDto = {
      ...this.mechanics[mechanicIndex],
      ...updateMechanicDto,
      updatedAt: new Date(),
    };
    this.mechanics[mechanicIndex] = updatedMechanic;
    return updatedMechanic;
  }
  // Remove a mechanic
  remove(mechanic_id: number): string {
    const mechanicIndex = this.mechanics.findIndex(
      (m) => m.mechanic_id === mechanic_id,
    );
    if (mechanicIndex === -1) {
      throw new NotFoundException(`Mechanic with ID ${mechanic_id} not found`);
    }
    this.mechanics.splice(mechanicIndex, 1);
    return `Mechanic with ID ${mechanic_id} removed successfully`;
  }
  // Search mechanics by name or email
  searchMechanics(query: string): CreateMechanicDto[] {
    return this.mechanics.filter(
      (mechanic) =>
        mechanic.name.toLowerCase().includes(query.toLowerCase()) ||
        mechanic.email.toLowerCase().includes(query.toLowerCase()),
    );
  }
}
