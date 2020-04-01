import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';

export class TaskStatusValidationPipe implements PipeTransform {
    readonly allowedStatuses = Object.keys(TaskStatus);

    transform(value: any, metadata: ArgumentMetadata) {
        value = value.toUpperCase();
        if (!this.isValidStatus(value)) {
            throw new BadRequestException(`Status ${value} is not supported`);
        }
        return value;
    }
    private isValidStatus(status: any): boolean {
        const idx = this.allowedStatuses.indexOf(status);
        return (idx !== -1);
    }
}
