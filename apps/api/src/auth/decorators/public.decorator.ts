/**
 * Public Decorator
 * Marks routes as public (no authentication required)
 */

import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);

