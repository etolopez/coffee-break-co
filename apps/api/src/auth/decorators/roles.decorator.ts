/**
 * Roles Decorator
 * Marks routes that require specific roles
 */

import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

