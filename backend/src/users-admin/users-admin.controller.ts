// backend/src/users-admin/users-admin.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
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

import {
  AdminUserQueryDto,
  AdminUserResponseDto,
  PaginatedAdminUsersResponseDto,
  AdminUpdateRolesDto,
  AdminCreateUserDto,
  AdminRoleResponseDto,
} from './dto';
import { UsersAdminService } from './users-admin.service';

@ApiTags('users-admin')
@ApiBearerAuth()
@Controller({ path: 'admin/users', version: '1' })
export class UsersAdminController {
  constructor(private readonly usersAdminService: UsersAdminService) {}

  @Get()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({
    summary: 'List users (Admin)',
    description: 'Retrieve paginated users with search, filter, and sorting.',
  })
  @ApiOkResponse({ type: PaginatedAdminUsersResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isLocked', required: false, type: Boolean })
  @ApiQuery({ name: 'roleName', required: false, type: String })
  async findAll(@Query() query: AdminUserQueryDto): Promise<PaginatedAdminUsersResponseDto> {
    return this.usersAdminService.findAll(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user statistics (Admin)' })
  @ApiOkResponse({ description: 'User statistics' })
  async getStats() {
    return this.usersAdminService.getStats();
  }

  @Get('roles')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Get all roles (for dropdown)' })
  @ApiOkResponse({ type: [AdminRoleResponseDto] })
  async getAllRoles(): Promise<AdminRoleResponseDto[]> {
    return this.usersAdminService.getAllRoles();
  }

  @Get(':id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Get user detail (Admin)' })
  @ApiOkResponse({ type: AdminUserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AdminUserResponseDto> {
    return this.usersAdminService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Create new user (Admin)',
    description: 'Creates a new user with temporary password and optional roles.',
  })
  @ApiCreatedResponse({ type: AdminUserResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async createUser(@Body() dto: AdminCreateUserDto): Promise<AdminUserResponseDto> {
    return this.usersAdminService.createUser(dto);
  }

  @Put(':id/lock')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Lock user (Admin)',
    description: 'Locks user account for 15 minutes. Rate limited strictly.',
  })
  @ApiNoContentResponse({ description: 'User locked successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiParam({ name: 'id', type: Number })
  async lockUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersAdminService.lockUser(id, 15);
  }

  @Put(':id/unlock')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Unlock user (Admin)',
    description: 'Unlocks user and resets login attempts. Rate limited.',
  })
  @ApiNoContentResponse({ description: 'User unlocked successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: Number })
  async unlockUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersAdminService.unlockUser(id);
  }

  @Put(':id/roles')
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Update user roles (Admin)',
    description: 'Replaces all roles of a user. Transaction-safe.',
  })
  @ApiOkResponse({ type: AdminUserResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid role IDs' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: Number })
  async updateRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateRolesDto,
  ): Promise<AdminUserResponseDto> {
    return this.usersAdminService.updateRoles(id, dto);
  }
}
