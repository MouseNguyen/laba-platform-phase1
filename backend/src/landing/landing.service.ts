import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LandingService {
  constructor(private prisma: PrismaService) {}

  async getLandingBlocks(locale: string = 'vi') {
    const blocks = await this.prisma.landingContent.findMany({
      where: {
        status: 'published',
        is_active: true,
        locale: locale,
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    return blocks.map((block) => ({
      key: block.key,
      title: block.title,
      subtitle: block.subtitle,
      short_story: block.short_story,
      image_url: block.image_url,
      image_mobile_url: block.image_mobile_url,
      image_alt: block.image_alt,
      story_link: block.story_link,
      story_link_target: block.story_link_target,
      sort_order: block.sort_order,
    }));
  }
}
