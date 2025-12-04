import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
    constructor(private readonly prisma: PrismaService) { }
    // TODO: Implement Branch CRUD, User-Branch assignment
}
