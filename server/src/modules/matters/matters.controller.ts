import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { MattersService } from './matters.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('matters')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('matters')
export class MattersController {
  constructor(private readonly mattersService: MattersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new legal matter' })
  async create(@Body() createMatterDto: any, @Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) throw new BadRequestException('Org ID missing');
    return this.mattersService.create(createMatterDto, orgId);
  }

  @Get()
  @ApiOperation({ summary: 'List all matters for the organization' })
  async findAll(@Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) throw new BadRequestException('Org ID missing');
    return this.mattersService.findAllByOrg(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single matter by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) throw new BadRequestException('Org ID missing');
    return this.mattersService.findOne(id, orgId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a legal matter' })
  async update(@Param('id') id: string, @Body() updateMatterDto: any, @Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) throw new BadRequestException('Org ID missing');
    return this.mattersService.update(id, updateMatterDto, orgId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a legal matter' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const orgId = req.user.orgId;
    if (!orgId) throw new BadRequestException('Org ID missing');
    return this.mattersService.remove(id, orgId);
  }
}
