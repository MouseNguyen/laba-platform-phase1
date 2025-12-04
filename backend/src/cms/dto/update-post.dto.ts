import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsBoolean,
    IsDateString,
    ValidateIf,
    Matches,
    MaxLength,
    IsString,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    Validate,
} from 'class-validator';

// Custom validator for update logic
@ValidatorConstraint({ name: 'isPublishedRequiresDate', async: false })
export class IsPublishedRequiresDateConstraint
    implements ValidatorConstraintInterface {
    validate(publishedAt: string, args: ValidationArguments) {
        const object = args.object as any;
        // If setting published=true, we need a date.
        // Either it's being set now (publishedAt) OR it was already set (we can't check DB here easily in DTO,
        // but usually we require it in the payload or handle it in service.
        // The requirement says: "publishedAt bắt buộc nếu isPublished=true"
        // In update, if isPublished is changing to true, we expect publishedAt.
        if (object.isPublished === true && !publishedAt && !object.publishedAt) {
            return false;
        }
        return true;
    }

    defaultMessage() {
        return 'publishedAt is required when isPublished is set to true';
    }
}

export class UpdatePostDto extends PartialType(CreatePostDto) {
    @ApiPropertyOptional({
        description:
            'WARNING: Slug should NOT be updated after creation to avoid breaking URLs',
        example: 'welcome-to-laba-farm',
        deprecated: true, // Mark as deprecated in Swagger
    })
    @IsOptional()
    @IsString()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug can only contain lowercase letters, numbers, and hyphens',
    })
    @MaxLength(200)
    slug?: string;

    @ApiPropertyOptional({
        description: 'Set to true to publish the post',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    @ApiPropertyOptional({
        description:
            'Required when setting isPublished=true if not already set. Will be auto-set to now() if omitted.',
        example: '2024-01-15T10:00:00.000Z',
    })
    @IsOptional()
    @Validate(IsPublishedRequiresDateConstraint)
    @ValidateIf((o) => o.isPublished === true)
    @IsDateString()
    publishedAt?: string;
}
