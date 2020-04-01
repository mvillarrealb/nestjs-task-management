import { Repository, EntityRepository } from 'typeorm';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDTO } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
    private logger: Logger = new Logger('TaskRepository');
    async createTask(
        createTaskDto: CreateTaskDTO,
        user: User,
    ): Promise<Task> {
        const { title, description } = createTaskDto;
        const task = new Task();
        task.title = title;
        task.description = description;
        task.user = user;
        task.status = TaskStatus.OPEN;
        try {
            await this.save(task);
        } catch (error) {
            this.logger.error(`Failed to create tasks for user ${user.username}. Data: ${JSON.stringify(createTaskDto)}`, error.stack);
            throw new InternalServerErrorException();
        }
        delete task.user;
        return task;
    }
    /**
     * Find all tasks that meets the criteria of the dto
     * @param filterDTO 
     */
    async getTasks(
        filterDTO: GetTasksFilterDTO,
        user: User,
    ): Promise<Task[]> {
        const { search, status } = filterDTO;
        const query = this.createQueryBuilder('task');
        query.andWhere('task.userId = :userId', { userId: user.id });
        if (status) {
            query.andWhere('task.status = :status', { status });
        }
        if (search) {
            query.andWhere('(task.title LIKE :search OR task.description LIKE :search)', { search: `%${search}%` });
        }
        try {
            const tasks = await query.getMany();
            return tasks;
        } catch (error) {
            this.logger.error(`Failed to get tasks for user ${user.username}. Filters: ${JSON.stringify(filterDTO)}`, error.stack);
            throw new InternalServerErrorException();
        }
    }
}
