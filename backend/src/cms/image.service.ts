/**
 * Image Processing Service
 * Automatically resizes and optimizes images for blog thumbnails
 * Supports both file upload and URL-based images
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

export interface ImageSizes {
    original: string;
    thumbnail: string;  // 400x300 - for cards
    medium: string;     // 800x600 - for blog list
    large: string;      // 1200x800 - for featured/detail
}

export interface ProcessedImage {
    urls: ImageSizes;
    width: number;
    height: number;
    format: string;
    size: number;
}

@Injectable()
export class ImageService {
    private readonly logger = new Logger(ImageService.name);
    private readonly uploadDir = './uploads';
    private readonly baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    // Standard sizes for blog images
    private readonly sizes = {
        thumbnail: { width: 400, height: 300 },
        medium: { width: 800, height: 600 },
        large: { width: 1200, height: 800 },
    };

    constructor() {
        // Ensure uploads directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Process an uploaded file
     */
    async processImage(file: Express.Multer.File): Promise<ProcessedImage> {
        const originalPath = file.path;
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.filename, ext);

        this.logger.log(`Processing image: ${file.filename}`);

        try {
            // Get original image metadata
            const metadata = await sharp(originalPath).metadata();

            // Process each size
            const urls: ImageSizes = {
                original: `${this.baseUrl}/uploads/${file.filename}`,
                thumbnail: await this.resizeImage(originalPath, baseName, 'thumbnail'),
                medium: await this.resizeImage(originalPath, baseName, 'medium'),
                large: await this.resizeImage(originalPath, baseName, 'large'),
            };

            // Get file size of the large version (main display)
            const largeFilename = `${baseName}-large.webp`;
            const largePath = path.join(this.uploadDir, largeFilename);
            const stats = fs.statSync(largePath);

            this.logger.log(`Image processed successfully: ${file.filename}`);
            this.logger.log(`Sizes generated: thumbnail, medium, large (webp)`);

            return {
                urls,
                width: metadata.width || 0,
                height: metadata.height || 0,
                format: 'webp',
                size: stats.size,
            };
        } catch (error) {
            this.logger.error(`Failed to process image: ${error}`);
            // Return original if processing fails
            return {
                urls: {
                    original: `${this.baseUrl}/uploads/${file.filename}`,
                    thumbnail: `${this.baseUrl}/uploads/${file.filename}`,
                    medium: `${this.baseUrl}/uploads/${file.filename}`,
                    large: `${this.baseUrl}/uploads/${file.filename}`,
                },
                width: 0,
                height: 0,
                format: ext.replace('.', ''),
                size: file.size,
            };
        }
    }

    /**
     * Process image from external URL
     * Downloads the image, resizes it, and returns local URLs
     */
    async processImageFromUrl(imageUrl: string): Promise<ProcessedImage> {
        this.logger.log(`Processing image from URL: ${imageUrl}`);

        // Validate URL
        if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
            throw new BadRequestException('Invalid image URL. Must start with http:// or https://');
        }

        try {
            // Download image to buffer
            const imageBuffer = await this.downloadImage(imageUrl);

            // Generate unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const baseName = `url-${uniqueSuffix}`;
            const originalFilename = `${baseName}.original`;
            const originalPath = path.join(this.uploadDir, originalFilename);

            // Save original buffer temporarily
            fs.writeFileSync(originalPath, imageBuffer);

            // Get metadata
            const metadata = await sharp(imageBuffer).metadata();

            // Process each size
            const urls: ImageSizes = {
                original: imageUrl, // Keep original URL as reference
                thumbnail: await this.resizeFromBuffer(imageBuffer, baseName, 'thumbnail'),
                medium: await this.resizeFromBuffer(imageBuffer, baseName, 'medium'),
                large: await this.resizeFromBuffer(imageBuffer, baseName, 'large'),
            };

            // Clean up temp original
            if (fs.existsSync(originalPath)) {
                fs.unlinkSync(originalPath);
            }

            // Get file size of the large version
            const largeFilename = `${baseName}-large.webp`;
            const largePath = path.join(this.uploadDir, largeFilename);
            const stats = fs.statSync(largePath);

            this.logger.log(`URL image processed successfully: ${baseName}`);

            return {
                urls,
                width: metadata.width || 0,
                height: metadata.height || 0,
                format: 'webp',
                size: stats.size,
            };
        } catch (error) {
            this.logger.error(`Failed to process URL image: ${error}`);

            // If processing fails, return original URL (no resize)
            return {
                urls: {
                    original: imageUrl,
                    thumbnail: imageUrl,
                    medium: imageUrl,
                    large: imageUrl,
                },
                width: 0,
                height: 0,
                format: 'unknown',
                size: 0,
            };
        }
    }

    /**
     * Download image from URL to buffer
     */
    private downloadImage(url: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;

            const request = protocol.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; LabaBot/1.0)',
                },
                timeout: 30000, // 30 second timeout
            }, (response) => {
                // Handle redirects
                if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    this.downloadImage(response.headers.location)
                        .then(resolve)
                        .catch(reject);
                    return;
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download image: HTTP ${response.statusCode}`));
                    return;
                }

                // Check content type
                const contentType = response.headers['content-type'] || '';
                if (!contentType.includes('image/')) {
                    reject(new Error('URL does not point to an image'));
                    return;
                }

                const chunks: Buffer[] = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
                response.on('error', reject);
            });

            request.on('error', reject);
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Image download timeout'));
            });
        });
    }

    /**
     * Resize image from buffer
     */
    private async resizeFromBuffer(
        buffer: Buffer,
        baseName: string,
        sizeName: 'thumbnail' | 'medium' | 'large',
    ): Promise<string> {
        const size = this.sizes[sizeName];
        const outputFilename = `${baseName}-${sizeName}.webp`;
        const outputPath = path.join(this.uploadDir, outputFilename);

        await sharp(buffer)
            .resize(size.width, size.height, {
                fit: 'cover',
                position: 'center',
            })
            .webp({
                quality: 85,
                effort: 4,
            })
            .toFile(outputPath);

        this.logger.debug(`Created ${sizeName}: ${outputFilename}`);
        return `${this.baseUrl}/uploads/${outputFilename}`;
    }

    /**
     * Resize image from file path
     */
    private async resizeImage(
        inputPath: string,
        baseName: string,
        sizeName: 'thumbnail' | 'medium' | 'large',
    ): Promise<string> {
        const size = this.sizes[sizeName];
        const outputFilename = `${baseName}-${sizeName}.webp`;
        const outputPath = path.join(this.uploadDir, outputFilename);

        await sharp(inputPath)
            .resize(size.width, size.height, {
                fit: 'cover',
                position: 'center',
            })
            .webp({
                quality: 85,
                effort: 4,
            })
            .toFile(outputPath);

        this.logger.debug(`Created ${sizeName}: ${outputFilename}`);
        return `${this.baseUrl}/uploads/${outputFilename}`;
    }

    /**
     * Clean up all generated versions of an image
     */
    async deleteImageVersions(filename: string): Promise<void> {
        const ext = path.extname(filename);
        const baseName = path.basename(filename, ext);

        const filesToDelete = [
            filename,
            `${baseName}-thumbnail.webp`,
            `${baseName}-medium.webp`,
            `${baseName}-large.webp`,
        ];

        for (const file of filesToDelete) {
            const filePath = path.join(this.uploadDir, file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.logger.debug(`Deleted: ${file}`);
            }
        }
    }
}
