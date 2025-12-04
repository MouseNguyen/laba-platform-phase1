import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersAdminService {
    constructor(private readonly prisma: PrismaService) { }
    // TODO: Implement admin-only operations: lockUser, unlockUser, updateRoles
}
