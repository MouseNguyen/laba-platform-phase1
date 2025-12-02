import { PrismaClient, LandingStatus, StoryLinkTarget } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting seed...');

  // 1. Seed admin user
  const adminEmail = 'admin@laba.vn';
  const adminPassword = 'Admin@123';

  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.log('👉 Creating admin user...');
    const password_hash = await argon2.hash(adminPassword, {
      type: argon2.argon2id,
    });

    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        full_name: 'Laba Admin',
        password_hash,
        // token_version default 0
      },
    });
  } else {
    console.log('✅ Admin user already exists.');
  }

  // 2. Seed branch
  const branchCode = 'laba-dalat';

  let branch = await prisma.branch.findFirst({
    where: { code: branchCode },
  });

  if (!branch) {
    console.log('👉 Creating default branch...');
    branch = await prisma.branch.create({
      data: {
        name: 'Laba Farm – Đà Lạt',
        code: branchCode,
        address: 'Đà Lạt',
        phone: null,
      },
    });
  } else {
    console.log('✅ Branch already exists.');
  }

  // 3. Seed landing contents
  const locale = 'vi';

  type LandingSeed = {
    key: string;
    title: string;
    subtitle?: string | null;
    short_story: string;
    image_url?: string | null;
    image_alt?: string | null;
    sort_order: number;
    status: LandingStatus;
    is_active: boolean;
  };

  const landingSeeds: LandingSeed[] = [
    {
      key: 'hero',
      title: 'Laba Farm – sống chậm giữa vườn, thở cùng thiên nhiên',
      subtitle: 'Một mảnh vườn nhỏ, mở ra cả thế giới sống lành.',
      short_story:
        'Laba Farm là nơi bạn có thể tạm rời phố xá ồn ào, bước chân xuống đất, chạm vào lá, và hít thở mùi cỏ ướt sau mưa. Ở đây, mỗi luống cây, mỗi giọt nước đều được chăm chút để vừa tốt cho đất, vừa tốt cho người. Đến chơi vài giờ, ở lại một đêm, hay đơn giản là ngồi im nhìn mây trôi – lựa chọn là của bạn.',
      image_url: '/images/landing/hero/hero-main.jpg',
      image_alt: 'Khu vườn Laba Farm nhìn từ xa',
      sort_order: 1,
      status: LandingStatus.published,
      is_active: true,
    },
    {
      key: 'farm',
      title: 'Nông trại – nơi cây được chăm như người nhà',
      subtitle: 'Canh tác bền vững, tôn trọng đất và nguồn nước.',
      short_story:
        'Khu farm của Laba được thiết kế như một khu vườn mở: khách có thể đi giữa các luống cây, sờ vào đất, hỏi bất cứ điều gì về cách trồng, cách tưới, cách bảo vệ cây mà không lạm dụng hoá chất. Chúng tôi ưu tiên hữu cơ, giảm thuốc, tăng vi sinh, để mỗi vụ mùa không chỉ cho ra sản phẩm đẹp mắt, mà còn để đất hôm sau khỏe hơn hôm nay.',
      image_url: '/images/landing/farm/farm-main.jpg',
      image_alt: 'Lối đi giữa các luống cây tại nông trại Laba',
      sort_order: 2,
      status: LandingStatus.published,
      is_active: true,
    },
    {
      key: 'homestay',
      title: 'Ở lại giữa vườn – thức dậy cùng nắng',
      subtitle: 'Những căn phòng nhỏ nằm giữa mảng xanh.',
      short_story:
        'Thay vì chỉ ghé thăm vài giờ, bạn có thể ở lại giữa vườn, mở mắt ra là thấy cây, tối về nghe côn trùng và gió. Homestay tại Laba hướng tới trải nghiệm chậm rãi, trong trẻo: phòng đơn giản, sạch sẽ, nhiều ánh sáng, mỗi căn đều nhìn ra một mảng xanh riêng. Buổi sáng nhâm nhi cà phê, nghe tiếng nước chảy và chuẩn bị cho một ngày mới thật nhẹ nhàng.',
      image_url: '/images/landing/homestay/homestay-main.jpg',
      image_alt: 'Phòng homestay nhỏ nằm giữa khu vườn Laba',
      sort_order: 3,
      status: LandingStatus.published,
      is_active: true,
    },
    {
      key: 'cafe',
      title: 'Quán cà phê trong vườn – nơi ngồi lâu cũng chẳng ai giục',
      subtitle: 'Đồ uống từ nguyên liệu trong vườn, không gian mở cả ngày.',
      short_story:
        'Quán cà phê của Laba nằm ngay giữa mảng cây, không nhạc ồn, không ánh đèn gắt. Ở đây, bạn có thể gọi một ly nước từ chính nguyên liệu trong vườn, mở laptop làm việc, đọc sách, hoặc chỉ ngồi nhìn trời. Trẻ con có chỗ chạy chơi, người lớn có chỗ thở. Mỗi ly nước là một câu chuyện nhỏ về mùa vụ, về cách trồng và cách chăm.',
      image_url: '/images/landing/cafe/cafe-main.jpg',
      image_alt: 'Quán cà phê giữa khu vườn tại Laba Farm',
      sort_order: 4,
      status: LandingStatus.published,
      is_active: true,
    },
    {
      key: 'about',
      title: 'Vì sao Laba tồn tại?',
      subtitle: 'Từ một mảnh vườn thử nghiệm đến không gian trải nghiệm cho mọi người.',
      short_story:
        'Laba bắt đầu từ câu hỏi rất đơn giản: nếu làm nông mà không làm hại đất, không làm hại sức khỏe người trồng lẫn người ăn thì phải làm thế nào? Từ những luống cây đầu tiên, chúng tôi dần xây thêm farm, homestay, quán cà phê để bất kỳ ai cũng có thể tới xem tận mắt. Laba không chỉ bán nông sản hay chỗ ở; chúng tôi muốn bán cảm giác yên tâm khi biết mình đang đối xử tử tế với đất, với cơ thể và với người xung quanh.',
      image_url: '/images/landing/about/about-main.jpg',
      image_alt: 'Nhóm sáng lập và câu chuyện phía sau Laba Farm',
      sort_order: 5,
      status: LandingStatus.published,
      is_active: true,
    },
    {
      key: 'product_highlight',
      title: 'Sản phẩm từ vườn – sẽ sớm ra mắt',
      subtitle: 'Nước nha đam, mứt, trà thảo mộc và nhiều hơn nữa.',
      short_story:
        'Trong giai đoạn tiếp theo, Laba sẽ dần giới thiệu các dòng sản phẩm chế biến từ chính nguồn nguyên liệu trong vườn: nước nha đam mát lành, trà thảo mộc sấy nhẹ, mứt trái cây ít đường... Mỗi sản phẩm đều được thiết kế quanh ba yếu tố: tốt cho cơ thể, minh bạch nguồn gốc, và đủ đẹp để bạn muốn mang tặng cho người mình thương.',
      image_url: null,
      image_alt: 'Các sản phẩm chế biến từ nông sản Laba',
      sort_order: 99,
      status: LandingStatus.draft,
      is_active: false,
    },
  ];

  console.log('👉 Seeding landing contents...');

  for (const item of landingSeeds) {
    await prisma.landingContent.upsert({
      where: {
        key_locale: {
          key: item.key,
          locale,
        },
      },
      update: {
        title: item.title,
        subtitle: item.subtitle ?? null,
        short_story: item.short_story,
        image_url: item.image_url ?? null,
        image_mobile_url: null,
        image_alt: item.image_alt ?? null,
        story_link: null,
        story_link_target: StoryLinkTarget.SELF,
        sort_order: item.sort_order,
        status: item.status,
        is_active: item.is_active,
        updated_by: admin?.id ?? null,
      },
      create: {
        key: item.key,
        locale,
        title: item.title,
        subtitle: item.subtitle ?? null,
        short_story: item.short_story,
        image_url: item.image_url ?? null,
        image_mobile_url: null,
        image_alt: item.image_alt ?? null,
        story_link: null,
        story_link_target: StoryLinkTarget.SELF,
        sort_order: item.sort_order,
        status: item.status,
        is_active: item.is_active,
        updated_by: admin?.id ?? null,
      },
    });
  }

  console.log('✅ Seed completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });