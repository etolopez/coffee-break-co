/**
 * Comments Service
 * Handles comments/ratings data operations
 * For MVP, returns empty array (can be extended later)
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Comment interface
 */
export interface Comment {
  id: string;
  coffeeId: string;
  rating: number;
  comment: string;
  userId?: string;
  createdAt?: string;
}

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  /**
   * Get comments for a coffee
   * For MVP, returns empty array
   * Can be extended to read from database or file storage
   */
  async getCommentsByCoffeeId(coffeeId: string): Promise<Comment[]> {
    // TODO: Implement actual data storage/retrieval
    // For now, return empty array
    return [];
  }
}
