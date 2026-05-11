import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List all alerts for the organization' })
  async findAll(@Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) throw new BadRequestException('Org ID missing');
    return this.alertsService.findAllByOrg(orgId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark an alert as read' })
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) throw new BadRequestException('Org ID missing');
    return this.alertsService.markAsRead(id, orgId);
  }

  @Post('check')
  @ApiOperation({ summary: 'Manually trigger alert generation' })
  async check(@Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) throw new BadRequestException('Org ID missing');
    return this.alertsService.generateAlertsForOrg(orgId);
  }
}
