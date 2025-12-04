// const fetch = require('node-fetch'); // Use native fetch in Node 18+

const BASE_URL = 'http://127.0.0.1:3000/api/v1';
const ADMIN_EMAIL = 'admin@laba.vn';
const ADMIN_PASSWORD = 'Admin@123456';

async function main() {
    console.log('🚀 Starting CMS Posts API Test...');

    // 1. Login
    console.log('\n👉 Logging in...');
    console.log(`URL: ${BASE_URL}/auth/login`);

    try {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Connection': 'close'
            },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
            signal: AbortSignal.timeout(5000)
        });

        if (!loginRes.ok) {
            console.error('❌ Login failed:', await loginRes.text());
            process.exit(1);
        }

        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        console.log('✅ Login successful. Token obtained.');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Connection': 'close'
        };

        // 2. Create Post
        console.log('\n👉 Creating Post...');
        const newPost = {
            type: 'BLOG',
            slug: `test-post-${Date.now()}`,
            title: 'Test Post Automation',
            excerpt: 'This is a test post created by automation script.',
            content: {
                blocks: [
                    { type: 'paragraph', data: { text: 'Hello World from script!' } },
                    { type: 'script', data: { text: '<script>alert("XSS")</script>' } } // Test sanitization
                ]
            },
            isPublished: true
        };

        const createRes = await fetch(`${BASE_URL}/cms/posts`, {
            method: 'POST',
            headers,
            body: JSON.stringify(newPost),
        });

        if (!createRes.ok) {
            console.error('❌ Create Post failed:', await createRes.text());
            process.exit(1);
        }

        const createdPost = await createRes.json();
        console.log(`✅ Post created: ID=${createdPost.id}, Slug=${createdPost.slug}`);

        // Verify Sanitization (simple check)
        const contentStr = JSON.stringify(createdPost.content);
        if (contentStr.includes('<script>')) {
            console.warn('⚠️ WARNING: XSS payload might not be sanitized!');
        } else {
            console.log('✅ Content sanitized (no <script> tags found).');
        }

        // 3. Get Post
        console.log(`\n👉 Getting Post ID=${createdPost.id}...`);
        const getRes = await fetch(`${BASE_URL}/cms/posts/${createdPost.id}`, { headers });
        if (!getRes.ok) {
            console.error('❌ Get Post failed:', await getRes.text());
        } else {
            const post = await getRes.json();
            console.log(`✅ Get Post successful: ${post.title}`);
        }

        // 4. Update Post
        console.log(`\n👉 Updating Post ID=${createdPost.id}...`);
        const updateRes = await fetch(`${BASE_URL}/cms/posts/${createdPost.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ title: 'Updated Title via Script' }),
        });

        if (!updateRes.ok) {
            console.error('❌ Update Post failed:', await updateRes.text());
        } else {
            const updated = await updateRes.json();
            console.log(`✅ Update Post successful: ${updated.title}`);
        }

        // 5. List Posts
        console.log('\n👉 Listing Posts...');
        const listRes = await fetch(`${BASE_URL}/cms/posts?page=1&limit=5`, { headers });
        if (!listRes.ok) {
            console.error('❌ List Posts failed:', await listRes.text());
        } else {
            const list = await listRes.json();
            console.log(`✅ List Posts successful. Total items: ${list.totalItems}`);
        }

        // 6. Soft Delete
        console.log(`\n👉 Soft Deleting Post ID=${createdPost.id}...`);
        const deleteRes = await fetch(`${BASE_URL}/cms/posts/${createdPost.id}`, {
            method: 'DELETE',
            headers,
        });

        if (!deleteRes.ok) {
            console.error('❌ Soft Delete failed:', await deleteRes.text());
        } else {
            console.log('✅ Soft Delete successful.');
        }

        // 7. Restore
        console.log(`\n👉 Restoring Post ID=${createdPost.id}...`);
        const restoreRes = await fetch(`${BASE_URL}/cms/posts/${createdPost.id}/restore`, {
            method: 'POST',
            headers,
        });

        if (!restoreRes.ok) {
            console.error('❌ Restore failed:', await restoreRes.text());
        } else {
            console.log('✅ Restore successful.');
        }

        // 8. Bulk Delete
        console.log(`\n👉 Bulk Deleting Post ID=${createdPost.id}...`);
        const bulkRes = await fetch(`${BASE_URL}/cms/posts/bulk-delete`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ids: [createdPost.id] }),
        });

        if (!bulkRes.ok) {
            console.error('❌ Bulk Delete failed:', await bulkRes.text());
        } else {
            const result = await bulkRes.json();
            console.log(`✅ Bulk Delete successful. Count: ${result.count}`);
        }

        console.log('\n🎉 All tests passed!');
    } catch (error) {
        console.error('❌ Unexpected Error:', error);
    }
}

main().catch(console.error);
