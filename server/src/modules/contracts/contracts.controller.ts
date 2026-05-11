import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a contract file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const orgId = req.user.orgId;
    if (!orgId) {
      throw new BadRequestException('User is not associated with an organization');
    }

    return this.contractsService.uploadContract(file, orgId, req.user.clerkId);
  }

  @Get()
  @ApiOperation({ summary: 'List all contracts for the organization' })
  async findAll(@Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) {
      throw new BadRequestException('User is not associated with an organization');
    }
    return this.contractsService.findAllByOrg(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single contract by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) {
      throw new BadRequestException('User is not associated with an organization');
    }
    return this.contractsService.findOne(id, orgId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search contracts by keyword' })
  async search(@Query('q') query: string, @Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) throw new BadRequestException('Org ID missing');
    return this.contractsService.search(query, orgId);
  }
}
