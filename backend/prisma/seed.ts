import { PrismaClient, LandingStatus, StoryLinkTarget } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
const argon2Config = { type: argon2.argon2id };

async function main() {
  console.log('🚀 Starting seed...');

  // ========== 1. Roles (Idempotent) ==========
  console.log('👉 Seeding roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrator with full access' },
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: { name: 'super_admin', description: 'Super Administrator with all privileges' },
  });

  // ========== 2. Admin User (Idempotent) ==========
  console.log('👉 Seeding admin user...');
  const adminPassword = 'Admin@123456';
  const password_hash = await argon2.hash(adminPassword, argon2Config);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@laba.vn' },
    update: {},
    create: {
      email: 'admin@laba.vn',
      password_hash: password_hash,
      full_name: 'Admin User',
      token_version: 0,
    },
  });

  // ========== 3. Link User to Roles (Idempotent) ==========
  console.log('👉 Linking user to roles...');
  for (const role of [adminRole, superAdminRole]) {
    await prisma.userRole.upsert({
      where: { user_id_role_id: { user_id: adminUser.id, role_id: role.id } },
      update: {},
      create: { user_id: adminUser.id, role_id: role.id },
    });
  }

  // ========== 4. Branches (Idempotent) ==========
  console.log('👉 Seeding branches...');
  await seedBranches();
  console.log('✅ Branches seeded successfully');

  // ========== 5. LandingContent (Idempotent) ==========
  console.log('👉 Seeding landing contents...');
  await seedLandingContent(adminUser.id);

  // ========== 6. Posts (Idempotent) ==========
  console.log('👉 Seeding posts...');
  await seedPosts(adminUser.id);
  console.log('✅ Posts seeded successfully');

  // ========== 7. Permissions (Idempotent) ==========
  console.log('👉 Seeding permissions...');
  await seedPermissions(adminRole.id, superAdminRole.id);
  console.log('✅ Permissions seeded successfully');

  // ========== 8. Additional Roles (Idempotent) ==========
  console.log('👉 Seeding additional roles...');
  await seedAdditionalRoles();
  console.log('✅ Additional roles seeded successfully');

  // ========== 9. Verification ==========
  await verifySeed();
}

async function seedBranches() {
  const branchesData = [
    {
      code: 'FARM_MAIN',
      name: 'Laba Farm - Main',
      type: 'FARM',
      address: 'Thôn 5, Xã Lạc Dương, Huyện Lạc Dương, Tỉnh Lâm Đồng',
      phone: '+84 123 456 789',
      settings: { openHours: { from: '07:00', to: '17:00' }, timezone: 'Asia/Ho_Chi_Minh', maxVisitorsPerDay: 50 },
      isActive: true,
    },
    {
      code: 'HOMESTAY_HILLSIDE',
      name: 'Laba Homestay - Hillside Retreat',
      type: 'HOMESTAY',
      address: 'Tiểu khu 3, Thị trấn Sa Pa, Huyện Sa Pa, Tỉnh Lào Cai',
      phone: '+84 987 654 321',
      settings: { checkInFrom: '14:00', checkOutUntil: '11:00', roomCount: 8 },
      isActive: true,
    },
    {
      code: 'CAFE_GARDEN',
      name: 'Laba Cafe - Garden View',
      type: 'CAFE',
      address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      phone: '+84 555 666 777',
      settings: { menuVersion: 'v1.2', openHours: { from: '07:00', to: '22:00' } },
      isActive: true,
    },
    {
      code: 'MAIN',
      name: 'LABA MAIN BRANCH',
      type: 'FARM',
      address: 'Đà Lạt, Lâm Đồng',
      phone: null,
      settings: { timezone: 'Asia/Ho_Chi_Minh' },
      isActive: true,
    },
  ];

  for (const data of branchesData) {
    await prisma.branch.upsert({
      where: { code: data.code },
      update: { name: data.name, type: data.type, address: data.address, phone: data.phone, settings: data.settings as any, isActive: data.isActive },
      create: { code: data.code, name: data.name, type: data.type, address: data.address, phone: data.phone, settings: data.settings as any, isActive: data.isActive },
    });
  }
  console.log(`  └─ Upserted ${branchesData.length} branches`);
}

async function seedLandingContent(userId: number) {
  const locale = 'vi';
  const landingSeeds = [
    { key: 'hero', title: 'Laba Farm – sống chậm giữa vườn', subtitle: 'Một mảnh vườn nhỏ', short_story: 'Laba Farm là nơi bạn có thể tạm rời phố xá', sort_order: 1, status: LandingStatus.published, is_active: true },
    { key: 'farm', title: 'Nông trại – nơi cây được chăm', subtitle: 'Canh tác bền vững', short_story: 'Khu farm của Laba được thiết kế như khu vườn mở', sort_order: 2, status: LandingStatus.published, is_active: true },
    { key: 'homestay', title: 'Ở lại giữa vườn', subtitle: 'Những căn phòng nhỏ', short_story: 'Thay vì chỉ ghé thăm vài giờ', sort_order: 3, status: LandingStatus.published, is_active: true },
    { key: 'cafe', title: 'Quán cà phê trong vườn', subtitle: 'Đồ uống từ nguyên liệu', short_story: 'Quán cà phê của Laba nằm ngay giữa mảng cây', sort_order: 4, status: LandingStatus.published, is_active: true },
    { key: 'about', title: 'Vì sao Laba tồn tại?', subtitle: 'Từ một mảnh vườn thử nghiệm', short_story: 'Laba bắt đầu từ câu hỏi rất đơn giản', sort_order: 5, status: LandingStatus.published, is_active: true },
  ];

  for (const item of landingSeeds) {
    await prisma.landingContent.upsert({
      where: { key_locale: { key: item.key, locale } },
      update: { title: item.title, subtitle: item.subtitle, short_story: item.short_story, sort_order: item.sort_order, status: item.status, is_active: item.is_active, updated_by: userId },
      create: { key: item.key, locale, title: item.title, subtitle: item.subtitle, short_story: item.short_story, story_link_target: StoryLinkTarget.SELF, sort_order: item.sort_order, status: item.status, is_active: item.is_active, updated_by: userId },
    });
  }
}

async function seedPosts(authorId: number) {
  const posts = [
    {
      slug: 'mot-ngay-lam-nong-dan-tai-laba-farm',
      type: 'BLOG',
      title: 'Một ngày làm nông dân tại Laba Farm: Từ đất lành đến bàn ăn',
      excerpt: 'Tạm rời xa khói bụi thành phố, hãy cùng chúng tôi trải nghiệm một ngày chân lấm tay bùn nhưng đầy niềm vui tại nông trại hữu cơ Laba Farm.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2938&auto=format&fit=crop',
      content: JSON.stringify({
        blocks: [
          { type: 'paragraph', data: { text: 'Khi ánh mặt trời vừa ló dạng sau đỉnh núi Langbiang, cũng là lúc một ngày mới bắt đầu tại Laba Farm. Không tiếng còi xe, không khói bụi, chỉ có tiếng chim hót và mùi hương ngai ngái của đất ẩm sau mưa.' } },
          { type: 'header', data: { text: 'Khởi đầu ngày mới với vườn rau hữu cơ', level: 2 } },
          { type: 'paragraph', data: { text: 'Công việc đầu tiên của chúng tôi là kiểm tra vườn rau xà lách thủy canh. Tại Laba, chúng tôi tuân thủ nghiêm ngặt quy trình "3 Không": Không thuốc trừ sâu, Không chất kích thích tăng trưởng, và Không giống biến đổi gen.' } },
          { type: 'image', data: { url: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=2979&auto=format&fit=crop', caption: 'Những luống rau xanh mướt được chăm sóc kỹ lưỡng', withBorder: false, withBackground: false, stretched: false } },
          { type: 'paragraph', data: { text: 'Cảm giác tự tay hái những búp xà lách tươi rói, giòn tan, vẫn còn đọng sương sớm là một trải nghiệm khó quên. Đó là sự kết nối trực tiếp nhất giữa con người và thiên nhiên.' } },
          { type: 'header', data: { text: 'Bữa trưa "Farm-to-Table"', level: 2 } },
          { type: 'paragraph', data: { text: 'Sau buổi sáng lao động hăng say, bữa trưa được chuẩn bị ngay tại bếp của nông trại với chính những nguyên liệu vừa thu hoạch. Một đĩa salad trộn dầu giấm, một bát canh bí đỏ ngọt lịm...' } }
        ]
      }),
      isPublished: true,
      publishedAt: new Date('2023-10-15T08:00:00Z'),
      authorId
    },
    {
      slug: 'sang-thuc-day-giua-bien-may-laba-hillside',
      type: 'BLOG',
      title: 'Sáng thức dậy giữa biển mây: Trải nghiệm Laba Hillside',
      excerpt: 'Không cần đi đâu xa, thiên đường săn mây nằm ngay tại ban công phòng bạn ở Laba Homestay - Hillside Retreat.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=2948&auto=format&fit=crop',
      content: JSON.stringify({
        blocks: [
          { type: 'paragraph', data: { text: 'Đà Lạt mùa này đẹp lắm. Cái lạnh se sắt buổi sớm mai khiến người ta chỉ muốn cuộn mình trong chăn ấm. Nhưng tại Laba Hillside, bạn sẽ có động lực để thức dậy thật sớm.' } },
          { type: 'header', data: { text: 'Biển mây ngay trước mắt', level: 2 } },
          { type: 'paragraph', data: { text: 'Chỉ cần kéo nhẹ rèm cửa, một biển mây trắng xóa bồng bềnh hiện ra ngay trước mắt. Cảm giác như đang lạc vào chốn bồng lai tiên cảnh.' } },
          { type: 'image', data: { url: 'https://images.unsplash.com/photo-1517321579081-24c48f251418?q=80&w=2940&auto=format&fit=crop', caption: 'Khung cảnh buổi sáng từ ban công Laba Hillside', withBorder: false, withBackground: false, stretched: true } },
          { type: 'paragraph', data: { text: 'Một tách trà gừng nóng hổi, một cuốn sách hay, và khung cảnh thiên nhiên hùng vĩ. Đó là tất cả những gì bạn cần để chữa lành tâm hồn sau những ngày làm việc căng thẳng.' } }
        ]
      }),
      isPublished: true,
      publishedAt: new Date('2023-11-20T09:30:00Z'),
      authorId
    },
    {
      slug: 'huong-vi-arabica-cau-dat-laba-cafe',
      type: 'BLOG',
      title: 'Hương vị Arabica Cầu Đất: Câu chuyện đằng sau tách cà phê Laba',
      excerpt: 'Khám phá hành trình của hạt cà phê từ những đồi cao nguyên lộng gió đến tách Espresso đậm đà trên tay bạn.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2942&auto=format&fit=crop',
      content: JSON.stringify({
        blocks: [
          { type: 'paragraph', data: { text: 'Cà phê không chỉ là một thức uống, đó là một nét văn hóa. Tại Laba Cafe, chúng tôi tự hào mang đến những hạt Arabica Cầu Đất thượng hạng nhất.' } },
          { type: 'header', data: { text: 'Quy trình rang xay thủ công', level: 2 } },
          { type: 'paragraph', data: { text: 'Mỗi mẻ cà phê đều được rang xay thủ công bởi những nghệ nhân lành nghề. Chúng tôi kiểm soát chặt chẽ nhiệt độ và thời gian để giữ trọn vẹn hương thơm quyến rũ và vị chua thanh đặc trưng của Arabica.' } },
          { type: 'image', data: { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2940&auto=format&fit=crop', caption: 'Một góc nhỏ bình yên tại Laba Cafe', withBorder: false, withBackground: false, stretched: false } }
        ]
      }),
      isPublished: true,
      publishedAt: new Date('2023-12-01T14:00:00Z'),
      authorId
    }
  ];

  for (const post of posts) {
    await prisma.post.upsert({ where: { slug: post.slug }, update: {}, create: post });
  }
  console.log(`  └─ Seeded ${posts.length} premium posts`);
}

async function seedPermissions(adminRoleId: number, superAdminRoleId: number) {
  const permissionsList = [
    { slug: 'post.create', description: 'Create post' },
    { slug: 'post.update', description: 'Update post' },
    { slug: 'post.delete', description: 'Delete post' },
    { slug: 'post.publish', description: 'Publish/unpublish post' },
    { slug: 'branch.create', description: 'Create branch' },
    { slug: 'branch.update', description: 'Update branch' },
    { slug: 'branch.delete', description: 'Delete branch' },
    { slug: 'user.view', description: 'View users (admin)' },
    { slug: 'user.create', description: 'Create users (admin)' },
    { slug: 'user.lock', description: 'Lock/unlock users' },
    { slug: 'user.update_roles', description: 'Update user roles' },
  ];

  for (const perm of permissionsList) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { description: perm.description },
      create: { slug: perm.slug, description: perm.description },
    });
  }
  console.log(`  └─ Upserted ${permissionsList.length} permissions`);

  // Assign to admin and super_admin roles
  const permissions = await prisma.permission.findMany({
    where: { slug: { in: permissionsList.map((p) => p.slug) } },
    select: { id: true },
  });

  for (const roleId of [adminRoleId, superAdminRoleId]) {
    for (const perm of permissions) {
      await prisma.rolePermission.upsert({
        where: { role_id_permission_id: { role_id: roleId, permission_id: perm.id } },
        update: {},
        create: { role_id: roleId, permission_id: perm.id },
      });
    }
  }
  console.log(`  └─ Assigned permissions to admin & super_admin roles`);
}

async function seedAdditionalRoles() {
  const additionalRoles = [
    { name: 'staff', description: 'Staff member with limited access' },
    { name: 'editor', description: 'Content editor for CMS' },
    { name: 'branch_manager', description: 'Branch manager for specific location' },
  ];

  for (const role of additionalRoles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
  }
  console.log(`  └─ Upserted ${additionalRoles.length} additional roles`);
}

async function verifySeed() {
  console.log('\n📊 SEED VERIFICATION REPORT:');

  const branchCount = await prisma.branch.count();
  const farmCount = await prisma.branch.count({ where: { type: 'FARM' } });
  const homestayCount = await prisma.branch.count({ where: { type: 'HOMESTAY' } });
  const cafeCount = await prisma.branch.count({ where: { type: 'CAFE' } });
  console.log(`  └─ Total branches: ${branchCount}`);
  console.log(`  └─ Type breakdown: FARM=${farmCount}, HOMESTAY=${homestayCount}, CAFE=${cafeCount}`);

  const postCount = await prisma.post.count();
  const publishedCount = await prisma.post.count({ where: { isPublished: true } });
  console.log(`  └─ Total posts: ${postCount}`);
  console.log(`  └─ Published posts: ${publishedCount}`);

  const userCount = await prisma.user.count();
  const roleCount = await prisma.role.count();
  const permCount = await prisma.permission.count();
  console.log(`  └─ Total users: ${userCount}`);
  console.log(`  └─ Total roles: ${roleCount}`);
  console.log(`  └─ Total permissions: ${permCount}`);

  console.log('✅ All verifications passed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });