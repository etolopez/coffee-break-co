/**
 * Comments Controller
 * REST API endpoints for comments/ratings
 */

import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CommentsService } from './comments.service';

@ApiTags('comments')
@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get comments for a coffee',
    description: 'Retrieve all comments/ratings for a specific coffee',
  })
  @ApiQuery({
    name: 'coffeeId',
    required: true,
    description: 'Coffee ID to get comments for',
  })
  @ApiResponse({
    status: 200,
    description: 'List of comments',
  })
  async getComments(@Query('coffeeId') coffeeId: string) {
    const comments = await this.commentsService.getCommentsByCoffeeId(coffeeId);
    return {
      success: true,
      data: comments,
    };
  }
}
