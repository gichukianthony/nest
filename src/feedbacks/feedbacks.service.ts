import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbacksService {
  private feedbacks: CreateFeedbackDto[] = [
    {
      feedback_id: 1,
      user_id: 1,
      comment: 'Great service!',
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      mechanic_id: 1,
    },
    {
      feedback_id: 2,
      user_id: 2,
      comment: 'Very helpful and professional.',
      rating: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      mechanic_id: 2,
    },
    {
      feedback_id: 3,
      user_id: 3,
      comment: 'Average experience, could be better.',
      rating: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      mechanic_id: 1,
    },
  ];
  // Create a new feedback
  create(feedback: CreateFeedbackDto): CreateFeedbackDto {
    const lastId: number | undefined =
      this.feedbacks.length > 0
        ? this.feedbacks[this.feedbacks.length - 1].feedback_id
        : 0;
    const newFeedback: CreateFeedbackDto = {
      feedback_id: (lastId ?? 0) + 1,
      user_id: feedback.user_id,
      comment: feedback.comment,
      rating: feedback.rating,
      createdAt: new Date(),
      updatedAt: new Date(),
      mechanic_id: feedback.mechanic_id,
    };
    this.feedbacks.push(newFeedback);
    return newFeedback;
  }

  // Find all feedbacks
  findAll(): CreateFeedbackDto[] {
    return this.feedbacks;
  }
  // Find a feedback by ID
  findOne(feedback_id: number): CreateFeedbackDto {
    const feedback = this.feedbacks.find((f) => f.feedback_id === feedback_id);
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${feedback_id} not found`);
    }
    return feedback;
  }
  // Update a feedback
  update(
    feedback_id: number,
    updateFeedbackDto: UpdateFeedbackDto,
  ): CreateFeedbackDto {
    const feedbackIndex = this.feedbacks.findIndex(
      (f) => f.feedback_id === feedback_id,
    );
    if (feedbackIndex === -1) {
      throw new NotFoundException(`Feedback with ID ${feedback_id} not found`);
    }
    const updatedFeedback: CreateFeedbackDto = {
      ...this.feedbacks[feedbackIndex],
      ...updateFeedbackDto,
      updatedAt: new Date(),
    };
    this.feedbacks[feedbackIndex] = updatedFeedback;
    return updatedFeedback;
  }
  // Remove a feedback
  remove(feedback_id: number): string {
    const feedbackIndex = this.feedbacks.findIndex(
      (f) => f.feedback_id === feedback_id,
    );
    if (feedbackIndex === -1) {
      throw new NotFoundException(`Feedback with ID ${feedback_id} not found`);
    }
    this.feedbacks.splice(feedbackIndex, 1);
    return `Feedback with ID ${feedback_id} removed successfully`;
  }
  // Find feedbacks by mechanic ID
  findByMechanicId(mechanic_id: number): CreateFeedbackDto[] {
    const feedbacks = this.feedbacks.filter(
      (f) => f.mechanic_id === mechanic_id,
    );
    if (feedbacks.length === 0) {
      throw new NotFoundException(
        `No feedback found for mechanic with ID ${mechanic_id}`,
      );
    }
    return feedbacks;
  }
  // Search feedbacks by comment
  searchFeedbacks(query: string): CreateFeedbackDto[] {
    return this.feedbacks.filter((f) =>
      f.comment.toLowerCase().includes(query.toLowerCase()),
    );
  }
}
