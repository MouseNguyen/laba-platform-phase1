import { Controller } from '@nestjs/common';
import { UsersAdminService } from './users-admin.service';

@Controller('admin/users') // Base route: /api/v1/admin/users
export class UsersAdminController {
    constructor(private readonly usersAdminService: UsersAdminService) { }
    // TODO: Add @UseGuards(JwtAuthGuard, PermissionGuard) for all routes
}
