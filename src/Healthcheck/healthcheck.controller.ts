import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthcheckController {
  @Get()
  findAll(): string {
    return 'The server is up and running';
  }
}
