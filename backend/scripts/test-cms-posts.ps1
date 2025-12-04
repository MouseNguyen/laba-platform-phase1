$BaseUrl = "http://127.0.0.1:3000/api/v1"
$AdminEmail = "admin@laba.vn"
$AdminPassword = "Admin@123456"

Write-Host "🚀 Starting CMS Posts API Test (PowerShell)..."

# 1. Login
Write-Host "`n👉 Logging in..."

$loginBody = @{
    email    = $AdminEmail
    password = $AdminPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    $token = $loginResponse.access_token

    if (-not $token) {
        Write-Host "❌ Login response does not contain access_token:" -ForegroundColor Red
        $loginResponse | ConvertTo-Json -Depth 5
        exit 1
    }

    Write-Host "✅ Login successful. Token obtained."
}
catch {
    Write-Host "❌ Login failed:" $_.Exception.Message -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# 2. Create Post
Write-Host "`n👉 Creating Post..."

$postBody = @{
    type        = "BLOG"
    slug        = "test-post-$([DateTime]::UtcNow.ToString('yyyyMMddHHmmss'))"
    title       = "Test Post Automation (PowerShell)"
    excerpt     = "This is a test post created by PowerShell script."
    content     = @{
        blocks = @(
            @{ type = "paragraph"; data = @{ text = "Hello World from PowerShell!" } }
        )
    }
    isPublished = $true
} | ConvertTo-Json -Depth 5

try {
    $createResponse = Invoke-RestMethod -Uri "$BaseUrl/cms/posts" `
        -Method Post `
        -Headers $headers `
        -Body $postBody

    $postId = $createResponse.id
    Write-Host "✅ Post created: ID=$postId, Slug=$($createResponse.slug)"
}
catch {
    Write-Host "❌ Create Post failed:" $_.Exception.Message -ForegroundColor Red
    exit 1
}

# 3. Get Post
Write-Host "`n👉 Getting Post ID=$postId..."
try {
    $getResponse = Invoke-RestMethod -Uri "$BaseUrl/cms/posts/$postId" `
        -Method Get `
        -Headers $headers

    Write-Host "✅ Get Post successful: $($getResponse.title)"
}
catch {
    Write-Host "❌ Get Post failed:" $_.Exception.Message -ForegroundColor Red
}

# 4. Update Post
Write-Host "`n👉 Updating Post ID=$postId..."

$updateBody = @{
    title = "Updated Title via PowerShell"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$BaseUrl/cms/posts/$postId" `
        -Method Patch `
        -Headers $headers `
        -Body $updateBody

    Write-Host "✅ Update Post successful: $($updateResponse.title)"
}
catch {
    Write-Host "❌ Update Post failed:" $_.Exception.Message -ForegroundColor Red
}

# 5. List Posts
Write-Host "`n👉 Listing Posts..."
try {
    $listResponse = Invoke-RestMethod -Uri "$BaseUrl/cms/posts?page=1&limit=5" `
        -Method Get `
        -Headers $headers

    Write-Host "✅ List Posts successful. Total items: $($listResponse.totalItems)"
}
catch {
    Write-Host "❌ List Posts failed:" $_.Exception.Message -ForegroundColor Red
}

# 6. Soft Delete
Write-Host "`n👉 Soft Deleting Post ID=$postId..."
try {
    Invoke-RestMethod -Uri "$BaseUrl/cms/posts/$postId" `
        -Method Delete `
        -Headers $headers

    Write-Host "✅ Soft Delete successful."
}
catch {
    Write-Host "❌ Soft Delete failed:" $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n🎉 All basic tests finished!" -ForegroundColor Green
