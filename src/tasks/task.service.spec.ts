import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('TaskService', () => {
    let tasksService: TasksService;
    let taskRepository;
    const mockTaskRepository = new TaskRepository();
    const mockUser: User = new User({ username: 'Test User', id:  0 });

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: TaskRepository, useValue: mockTaskRepository },
            ],
        }).compile();
        tasksService   = module.get<TasksService>(TasksService);
        taskRepository = module.get<TaskRepository>(TaskRepository);
    });
    it('should be defined', () => {
        expect(tasksService).toBeDefined();
    });
    describe('getTaks', () => {
        const mockQueryBuilder = {
            andWhere: jest.fn(),
            getMany: jest.fn(),
        };
        const filters: GetTasksFilterDTO = { status: TaskStatus.IN_PROGRESS, search: 'search query' };
        it('gets all tasks from the repository', async () => {
            jest.spyOn(taskRepository, 'createQueryBuilder').mockImplementationOnce(() => mockQueryBuilder);
            mockQueryBuilder.getMany.mockResolvedValue([]);

            expect(mockQueryBuilder.getMany).not.toHaveBeenCalled();
            const result = await tasksService.getTasks(filters, mockUser);
            expect(result).toEqual([]);
            expect(mockQueryBuilder.getMany).toHaveBeenCalled();
        });
        it('Handle errors on search', async () => {
            jest.spyOn(taskRepository, 'createQueryBuilder').mockImplementationOnce(() => mockQueryBuilder);
            mockQueryBuilder.getMany.mockRejectedValue([]);
            expect(tasksService.getTasks(filters, mockUser)).rejects.toThrow(InternalServerErrorException);
        });
    });
    describe('getTaskById', () => {
        it('calls taskRepository.findOne() and successfully retrieve and return the task',  async () => {
            const mockTask = { title: 'Test task', description: 'task desc'};
            jest.spyOn(taskRepository, 'findOne').mockImplementation(async () => mockTask);
            const result  = await tasksService.getTaskById(1, mockUser);
            expect(result).toEqual(mockTask);
            expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: mockUser.id } });
        });
        it('throws an error as a task is not found', async () => {
            jest.spyOn(taskRepository, 'findOne').mockImplementation(async () => null);
            expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });
    describe('createTask', () => {
        const title = 'HELLO';
        const description = 'WORLD';
        const createTaskDTO = { title, description };
        it('calls taskRepository.create() and returns the result', async () => {
            const createdTask = {
                title,
                description,
                user: mockUser,
                status: TaskStatus.OPEN,
            };
            jest.spyOn(taskRepository, 'save').mockImplementation(async () => createdTask);
            expect(taskRepository.save).not.toHaveBeenCalled();
            const result = await tasksService.createTask(createTaskDTO, mockUser);
            expect(result).toHaveProperty('title', createdTask.title);
            expect(result).toHaveProperty('description', createdTask.description);
            expect(result).toHaveProperty('status', createdTask.status);
            expect(taskRepository.save).toHaveBeenCalled();
        });
        it('calls taskRepository.create() should catch errors', async () => {
            jest.spyOn(taskRepository, 'save').mockRejectedValue(async () => null);
            expect(tasksService.createTask(createTaskDTO, mockUser)).rejects.toThrow(InternalServerErrorException);
        });
    });
    describe('deleteTask', () => {
        it('calls taskService.deleteTask() its ok', async () => {
            jest.spyOn(taskRepository, 'delete').mockImplementation(async () => {
                return { affected: 1 };
            });
            expect(taskRepository.delete).not.toHaveBeenCalled();
            expect(tasksService.deleteTask(1, mockUser)).resolves.not.toThrow();
            expect(taskRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id });
        });
        it('calls taskService.deleteTask() throws errors', async () => {
            jest.spyOn(taskRepository, 'delete').mockImplementation(async () => {
                return { affected: 0 };
            });
            expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });
    describe('updateTaskStatus', () => {
        it('calls taskService.updateTask its ok', async () => {
            taskRepository.save = jest.fn().mockResolvedValue(true);
            tasksService.getTaskById = jest.fn().mockResolvedValue({
                status: TaskStatus.OPEN,
            });
            expect(tasksService.getTaskById).not.toHaveBeenCalled();
            expect(taskRepository.save).not.toHaveBeenCalled();
            const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser);
            expect(result.status).toEqual(TaskStatus.DONE);
            expect(tasksService.getTaskById).toHaveBeenCalled();
            expect(taskRepository.save).toHaveBeenCalled();

        });
    });
});
