import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskRepository)
        private readonly tasksRepository: TaskRepository,
    ) {}
    getTasks(filterDto: GetTasksFilterDTO, user: User): Promise<Task[]> {
        return this.tasksRepository.getTasks(filterDto, user);
    }

    async getTaskById(id: number, user: User): Promise<Task> {
        const foundTask = await this.tasksRepository.findOne( { where: { id, userId: user.id } });
        if (!foundTask) {
            throw new NotFoundException(`Task with id ${id} does not exists`);
        }
        return foundTask;
    }

    async createTask(
        createTaskDTO: CreateTaskDTO,
        user: User,
    ): Promise<Task> {
       return this.tasksRepository.createTask(createTaskDTO, user);
    }

    async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise<Task> {
        const task = await this.getTaskById(id, user);
        task.status = status;
        await this.tasksRepository.save(task);
        return task;
    }
    async deleteTask(id: number, user: User): Promise<void> {
        const result = await this.tasksRepository.delete({ id, userId: user.id });
        if (result.affected === 0 ) {
            throw new NotFoundException(`Task with id ${id} does not exists`);
        }
    }
}
