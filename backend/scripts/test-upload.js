const fs = require('fs');
const path = require('path');
const { fetch, FormData } = require('undici'); // Use undici for both fetch and FormData
// const FormData = require('form-data'); // Remove old form-data

const BASE_URL = 'http://localhost:3000/api/v1';
let TOKEN = '';

async function login() {
    console.log('👉 Logging in...');
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@laba.vn',
                password: 'Admin@123456',
            }),
        });

        if (!response.ok) {
            throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        TOKEN = data.access_token;
        console.log('✅ Login successful.');
    } catch (error) {
        console.error('❌ Login error:', error.message);
        process.exit(1);
    }
}

async function uploadImage() {
    console.log('👉 Uploading Image...');
    try {
        // Create a dummy image file
        const filePath = path.join(__dirname, 'test-image.png');
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, 'fake image content'); // This might fail validation if we check magic numbers
        }

        // Better: use a real small image or just text file renamed if validation is weak
        // Since we check mimetype in controller using file.mimetype (which comes from extension/header), 
        // and we check extension regex.
        // But we assume the user has a real image or we create one. 
        // For now let's create a text file but name it .png. 
        // Note: Controller checks `file.mimetype.match(...)`. Multer derives this from extension usually unless magic number check is enabled.

        const form = new FormData();
        const fileContent = fs.readFileSync(filePath);
        const blob = new Blob([fileContent], { type: 'image/png' });
        form.append('file', blob, 'test-image.png');

        const response = await fetch(`${BASE_URL}/cms/uploads/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
            },
            body: form,
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Upload failed: ${response.status} ${text}`);
        }

        const data = await response.json();
        console.log('✅ Upload successful:', data);

        // Verify access
        const fileUrl = data.url;
        console.log(`👉 Verifying access to ${fileUrl}...`);
        const fileResponse = await fetch(fileUrl);
        if (fileResponse.ok) {
            console.log('✅ File is accessible!');
        } else {
            console.error('❌ File access failed:', fileResponse.status);
        }

    } catch (error) {
        console.error('❌ Upload error:', error.message);
    }
}

async function main() {
    await login();
    await uploadImage();
}

main();
