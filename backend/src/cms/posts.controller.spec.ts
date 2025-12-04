/**
 * POSTS CONTROLLER TESTS
 * Module: CMS (Content Management)
 * Phase: 1
 *
 * @author Laba Platform Team
 * @since 2024-01-15
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

describe('PostsController', () => {
    let controller: PostsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostsController],
            providers: [
                {
                    provide: PostsService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        softDelete: jest.fn(),
                        restore: jest.fn(),
                        bulkDelete: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<PostsController>(PostsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
