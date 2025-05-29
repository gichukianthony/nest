import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Mechanic } from 'src/mechanics/entities/mechanic.entity';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Mechanic)
    private mechanicRepository: Repository<Mechanic>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    try {
      // Validate that at least one of user or mechanic is provided
      if (!createFeedbackDto.user && !createFeedbackDto.mechanic) {
        throw new BadRequestException(
          'Either user or mechanic must be provided',
        );
      }

      const feedback = this.feedbackRepository.create({
        comment: createFeedbackDto.comment,
        rating: createFeedbackDto.rating,
      });

      // Handle user relationship if provided
      if (createFeedbackDto.user) {
        const user = await this.userRepository.findOne({
          where: { id: createFeedbackDto.user },
        });
        if (!user) {
          throw new NotFoundException(
            `User with ID ${createFeedbackDto.user} not found`,
          );
        }
        feedback.user = user;
      }

      // Handle mechanic relationship if provided
      if (createFeedbackDto.mechanic) {
        const mechanic = await this.mechanicRepository.findOne({
          where: { id: createFeedbackDto.mechanic },
        });
        if (!mechanic) {
          throw new NotFoundException(
            `Mechanic with ID ${createFeedbackDto.mechanic} not found`,
          );
        }
        feedback.mechanic = mechanic;
      }

      return await this.feedbackRepository.save(feedback);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error creating feedback:', error);
      throw new Error('Feedback could not be created');
    }
  }

  async findAll(user_id?: number): Promise<Feedback[]> {
    const queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .leftJoinAndSelect('feedback.mechanic', 'mechanic');

    if (user_id) {
      queryBuilder.where('user.id = :userId', { userId: user_id });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['user', 'mechanic'],
    });
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  async update(id: number, updateDto: UpdateFeedbackDto): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['user', 'mechanic'],
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // Update basic fields
    if (updateDto.comment) feedback.comment = updateDto.comment;
    if (updateDto.rating) feedback.rating = updateDto.rating;

    // Handle user relationship if provided
    if (updateDto.user) {
      const user = await this.userRepository.findOne({
        where: { id: updateDto.user },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${updateDto.user} not found`);
      }
      feedback.user = user;
    }

    // Handle mechanic relationship if provided
    if (updateDto.mechanic) {
      const mechanic = await this.mechanicRepository.findOne({
        where: { id: updateDto.mechanic },
      });
      if (!mechanic) {
        throw new NotFoundException(
          `Mechanic with ID ${updateDto.mechanic} not found`,
        );
      }
      feedback.mechanic = mechanic;
    }

    return await this.feedbackRepository.save(feedback);
  }

  async remove(id: number): Promise<string> {
    const feedback = await this.feedbackRepository.findOneBy({ id });
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    await this.feedbackRepository.remove(feedback);
    return `Feedback with ID ${id} removed successfully`;
  }

  async searchFeedbacks(query: string): Promise<Feedback[]> {
    return this.feedbackRepository
      .createQueryBuilder('feedback')
      .where('LOWER(feedback.comment) LIKE :query', {
        query: `%${query.toLowerCase()}%`,
      })
      .leftJoinAndSelect('feedback.user', 'user')
      .leftJoinAndSelect('feedback.mechanic', 'mechanic')
      .getMany();
  }

  async findByMechanicId(mechanic_id: number): Promise<Feedback[]> {
    return this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .leftJoinAndSelect('feedback.mechanic', 'mechanic')
      .where('mechanic.id = :mechanicId', { mechanicId: mechanic_id })
      .getMany();
  }
}

// export class FeedbacksService {
//   private feedbacks: CreateFeedbackDto[] = [
//     {
//       feedback_id: 1,
//       user_id: 1,
//       comment: 'Great service!',
//       rating: 5,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       mechanic_id: 1,
//     },
//     {
//       feedback_id: 2,
//       user_id: 2,
//       comment: 'Very helpful and professional.',
//       rating: 4,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       mechanic_id: 2,
//     },
//     {
//       feedback_id: 3,
//       user_id: 3,
//       comment: 'Average experience, could be better.',
//       rating: 3,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       mechanic_id: 1,
//     },
//   ];
//   // Create a new feedback
//   create(feedback: CreateFeedbackDto): CreateFeedbackDto {
//     const lastId: number | undefined =
//       this.feedbacks.length > 0
//         ? this.feedbacks[this.feedbacks.length - 1].feedback_id
//         : 0;
//     const newFeedback: CreateFeedbackDto = {
//       feedback_id: (lastId ?? 0) + 1,
//       user_id: feedback.user_id,
//       comment: feedback.comment,
//       rating: feedback.rating,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       mechanic_id: feedback.mechanic_id,
//     };
//     this.feedbacks.push(newFeedback);
//     return newFeedback;
//   }

//   // Find all feedbacks
//   findAll(): CreateFeedbackDto[] {
//     return this.feedbacks;
//   }
//   // Find a feedback by ID
//   findOne(feedback_id: number): CreateFeedbackDto {
//     const feedback = this.feedbacks.find((f) => f.feedback_id === feedback_id);
//     if (!feedback) {
//       throw new NotFoundException(`Feedback with ID ${feedback_id} not found`);
//     }
//     return feedback;
//   }
//   // Update a feedback
//   update(
//     feedback_id: number,
//     updateFeedbackDto: UpdateFeedbackDto,
//   ): CreateFeedbackDto {
//     const feedbackIndex = this.feedbacks.findIndex(
//       (f) => f.feedback_id === feedback_id,
//     );
//     if (feedbackIndex === -1) {
//       throw new NotFoundException(`Feedback with ID ${feedback_id} not found`);
//     }
//     const updatedFeedback: CreateFeedbackDto = {
//       ...this.feedbacks[feedbackIndex],
//       ...updateFeedbackDto,
//       updatedAt: new Date(),
//     };
//     this.feedbacks[feedbackIndex] = updatedFeedback;
//     return updatedFeedback;
//   }
//   // Remove a feedback
//   remove(feedback_id: number): string {
//     const feedbackIndex = this.feedbacks.findIndex(
//       (f) => f.feedback_id === feedback_id,
//     );
//     if (feedbackIndex === -1) {
//       throw new NotFoundException(`Feedback with ID ${feedback_id} not found`);
//     }
//     this.feedbacks.splice(feedbackIndex, 1);
//     return `Feedback with ID ${feedback_id} removed successfully`;
//   }
//   // Find feedbacks by mechanic ID
//   findByMechanicId(mechanic_id: number): CreateFeedbackDto[] {
//     const feedbacks = this.feedbacks.filter(
//       (f) => f.mechanic_id === mechanic_id,
//     );
//     if (feedbacks.length === 0) {
//       throw new NotFoundException(
//         `No feedback found for mechanic with ID ${mechanic_id}`,
//       );
//     }
//     return feedbacks;
//   }
//   // Search feedbacks by comment
//   searchFeedbacks(query: string): CreateFeedbackDto[] {
//     return this.feedbacks.filter((f) =>
//       f.comment.toLowerCase().includes(query.toLowerCase()),
//     );
//   }
// }
