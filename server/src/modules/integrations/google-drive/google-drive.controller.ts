import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { ContractsService } from '../../contracts/contracts.service';
import { ClerkAuthGuard } from '../../../common/guards/clerk-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('integrations/google-drive')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('integrations/google-drive')
export class GoogleDriveController {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly contractsService: ContractsService,
  ) {}

  @Get('auth-url')
  @ApiOperation({ summary: 'Get Google OAuth2 authorization URL' })
  async getAuthUrl() {
    return { url: this.googleDriveService.getAuthUrl() };
  }

  @Post('tokens')
  @ApiOperation({ summary: 'Exchange authorization code for tokens' })
  async getTokens(@Body('code') code: string) {
    if (!code) throw new BadRequestException('Code is required');
    return this.googleDriveService.getTokens(code);
  }

  @Get('files')
  @ApiOperation({ summary: 'List files from Google Drive' })
  async listFiles(@Query('accessToken') accessToken: string) {
    if (!accessToken) throw new BadRequestException('Access token is required');
    return this.googleDriveService.listFiles(accessToken);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import a file from Google Drive' })
  async importFile(
    @Body('fileId') fileId: string,
    @Body('fileName') fileName: string,
    @Query('accessToken') accessToken: string,
    @Req() req: any,
  ) {
    if (!fileId || !accessToken) {
      throw new BadRequestException('File ID and access token are required');
    }

    const orgId = req.user.orgId;
    const userId = req.user.userId;

    const buffer = await this.googleDriveService.downloadFile(accessToken, fileId);
    
    // Create a mock Multer file object for the contracts service
    const mockFile: any = {
      buffer,
      originalname: fileName,
      mimetype: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: buffer.length,
    };

    return this.contractsService.uploadContract(mockFile, orgId, userId);
  }
}
