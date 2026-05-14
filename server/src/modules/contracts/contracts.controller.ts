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
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

import axios from 'axios';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post(':id/chat')
  @ApiOperation({ summary: 'Chat with the contract using AI' })
  async chat(@Param('id') id: string, @Body('query') query: string, @Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) throw new BadRequestException('Org ID missing');

    const contract = await this.contractsService.findOne(id, orgId);
    if (!contract || !contract.full_text) {
      throw new BadRequestException('Contract text not found for AI analysis');
    }

    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3001';
      const response = await axios.post(`${aiServiceUrl}/api/chat`, {
        text: contract.full_text,
        query: query
      });
      return response.data;
    } catch (error) {
      throw new BadRequestException('AI Service failed to respond');
    }
  }

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
  async uploadFile(
    @UploadedFile() file: Express.Multer.File, 
    @Req() req: any,
    @Body('document_type') documentType?: string
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const orgId = req.user.orgId;
    if (!orgId) {
      throw new BadRequestException('User is not associated with an organization');
    }

    return this.contractsService.uploadContract(file, orgId, req.user.clerkId, documentType);
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

  @Post(':id/delete') // Using Post for better compatibility or just @Delete
  @ApiOperation({ summary: 'Delete a contract' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) {
      throw new BadRequestException('User is not associated with an organization');
    }
    return this.contractsService.remove(id, orgId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contract details' })
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) {
      throw new BadRequestException('User is not associated with an organization');
    }
    return this.contractsService.update(id, data, orgId);
  }
}
