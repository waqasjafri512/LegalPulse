import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/settings')
  @ApiOperation({ summary: 'Get current user settings' })
  async getSettings(@Req() req: any) {
    const clerkId = req.user.clerkId;
    const user = await this.usersService.findByClerkId(clerkId);
    return user?.settings || {};
  }

  @Patch('me/settings')
  @ApiOperation({ summary: 'Update current user settings' })
  async updateSettings(@Req() req: any, @Body() settings: any) {
    const clerkId = req.user.clerkId;
    const user = await this.usersService.findByClerkId(clerkId);
    
    // Merge new settings with existing ones
    const newSettings = { ...(user?.settings || {}), ...settings };
    
    return this.usersService.update(clerkId, { settings: newSettings });
  }
}
