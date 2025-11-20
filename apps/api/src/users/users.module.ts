/**
 * Users Module
 * Handles user profiles and favorites
 */

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';
import { CoffeeModule } from '../coffee/coffee.module';

@Module({
  imports: [DatabaseModule, CoffeeModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

