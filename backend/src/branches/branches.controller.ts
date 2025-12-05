// backend/src/branches/branches.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { BranchesService } from './branches.service';
import {
  BranchQueryDto,
  BranchResponseDto,
  PaginatedBranchesResponseDto,
  CreateBranchDto,
  UpdateBranchDto,
  BranchTypeEnum,
} from './dto';

@ApiTags('branches')
@ApiBearerAuth()
@Controller({ path: 'branches', version: '1' })
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  // =============================================
  // CREATE BRANCH
  // =============================================
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Create new branch (Admin)',
    description: 'Creates a new branch. Requires authentication.',
  })
  @ApiCreatedResponse({
    description: 'Branch created successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Branch code already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 422, description: 'Invalid input data' })
  async create(@Body() dto: CreateBranchDto): Promise<BranchResponseDto> {
    return this.branchesService.create(dto);
  }

  // =============================================
  // GET ALL BRANCHES (Paginated)
  // =============================================
  @Get()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get paginated branches',
    description: 'Retrieve branches with filtering, sorting, and pagination.',
  })
  @ApiOkResponse({
    description: 'List of branches retrieved successfully',
    type: PaginatedBranchesResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'type', required: false, enum: BranchTypeEnum })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'name', 'type', 'code'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async findAll(@Query() query: BranchQueryDto): Promise<PaginatedBranchesResponseDto> {
    return this.branchesService.findAll(query);
  }

  // =============================================
  // GET BRANCH STATS
  // =============================================
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get branch statistics (Admin)',
    description: 'Get total, active, and type breakdown of branches.',
  })
  @ApiOkResponse({
    description: 'Branch statistics retrieved successfully',
  })
  async getStats() {
    return this.branchesService.getStats();
  }

  // =============================================
  // GET BRANCH BY ID
  // =============================================
  @Get(':id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get branch by ID',
    description: 'Retrieve a specific branch by its ID.',
  })
  @ApiOkResponse({
    description: 'Branch retrieved successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Branch ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BranchResponseDto> {
    return this.branchesService.findOne(id);
  }

  // =============================================
  // UPDATE BRANCH
  // =============================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Update branch (Admin)',
    description: 'Updates branch fields. Code can be changed but must be unique.',
  })
  @ApiOkResponse({
    description: 'Branch updated successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({ status: 400, description: 'New code already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Branch ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    return this.branchesService.update(id, dto);
  }

  // =============================================
  // DELETE BRANCH (Soft Delete)
  // =============================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Soft delete branch (Admin)',
    description: 'Marks branch as deleted. Data is retained for audit.',
  })
  @ApiNoContentResponse({ description: 'Branch deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Branch ID' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.branchesService.softDelete(id);
  }

  // =============================================
  // RESTORE BRANCH
  // =============================================
  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Restore deleted branch (Admin)',
    description: 'Restores a soft-deleted branch.',
  })
  @ApiOkResponse({
    description: 'Branch restored successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Deleted branch not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Branch ID' })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<BranchResponseDto> {
    return this.branchesService.restore(id);
  }
}
