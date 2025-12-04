import { Controller } from '@nestjs/common';
import { BranchesService } from './branches.service';

@Controller('branches') // Base route: /api/v1/branches
export class BranchesController {
    constructor(private readonly branchesService: BranchesService) { }
    // TODO: Add CRUD endpoints, search, assign staff
}
