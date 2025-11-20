import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @Public()
  @ApiOperation({
    summary: 'API Root',
    description: 'Get API information and available endpoints',
  })
  @ApiResponse({
    status: 200,
    description: 'API information',
  })
  getRoot() {
    return {
      message: 'Coffee Digital Passport API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        root: 'GET /',
        health: 'GET /health',
        capture: 'POST /api/epcis/capture',
        coffees: 'GET /api/coffee-entries',
        sellers: 'GET /api/sellers'
      }
    };
  }

  @Get('health')
  @Public()
  @ApiOperation({
    summary: 'Health Check',
    description: 'Check API health status',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}

