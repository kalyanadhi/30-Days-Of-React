import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return { status: 'ok', service: 'engineering-manager-dashboard-api', timestamp: new Date().toISOString() };
  }
}
