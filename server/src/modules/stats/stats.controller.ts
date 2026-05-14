import { Controller, Get, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(@Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) {
      throw new BadRequestException('User is not associated with an organization');
    }
    return this.statsService.getDashboardStats(orgId);
  }
}
