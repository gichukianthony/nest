import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { FeedbackPolicies } from 'src/casl/policies/feedback-policies';
import { Request } from 'express';
import { Role } from '../users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Feedback } from './entities/feedback.entity';

interface RequestWithUser extends Request {
  user: {
    id: number;
    role: Role;
  };
}
@ApiTags('Feedbacks')
@ApiBearerAuth('JWT-auth')
@Controller('feedbacks')
@UseGuards(PoliciesGuard)
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Create a new feedback',
    description:
      'Submit a new feedback for a service or mechanic. Requires authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback created successfully',
    type: Feedback,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbacksService.create(createFeedbackDto);
  }
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all feedbacks',
    description: 'Retrieve a list of all feedbacks. Requires authentication.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of feedbacks retrieved successfully',
    type: [Feedback],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.feedbacksService.findAll(page, limit);
  }
  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get feedback by ID',
    description:
      'Retrieve a specific feedback by its ID. Requires authentication.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the feedback to retrieve',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback found',
    type: Feedback,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.feedbacksService.findOne(id);
  }
  @Public()
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a feedback',
    description:
      'Update a feedback by its ID. Requires ADMIN or SUPER_ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the feedback to update',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback updated successfully',
    type: Feedback,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbacksService.update(id, updateFeedbackDto);
  }
  @Public()
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a feedback',
    description:
      'Delete a feedback by its ID. Requires ADMIN or SUPER_ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the feedback to delete',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Feedback with ID 1 removed successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.feedbacksService.remove(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => FeedbackPolicies.read(ability))
  @Get('mechanic/:mechanic_id')
  async findByMechanicId(
    @Param('mechanic_id', ParseIntPipe) mechanic_id: number,
  ) {
    return await this.feedbacksService.findByMechanicId(mechanic_id);
  }
}
