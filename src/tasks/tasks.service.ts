import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  TasksRepository,
  type TaskRecord,
} from "./application/tasks.repository";
import { CreateTaskDto, UpdateTaskDto } from "./presentation/task.dto";

@Injectable()
export class TasksService {
  constructor(
    @Inject(TasksRepository) private readonly tasks: TasksRepository,
  ) {}

  async list(userId: number) {
    return (await this.tasks.findAll(userId)).map((task) =>
      this.publicTask(task),
    );
  }

  async get(userId: number, id: number) {
    const task = await this.tasks.findOne(userId, id);
    if (!task) throw new NotFoundException("Task not found");
    return this.publicTask(task);
  }

  async create(userId: number, input: CreateTaskDto) {
    return this.publicTask(await this.tasks.create(userId, input));
  }

  async update(userId: number, id: number, input: UpdateTaskDto) {
    const task = await this.tasks.update(userId, id, input);
    if (!task) throw new NotFoundException("Task not found");
    return this.publicTask(task);
  }

  async setCompletion(userId: number, id: number, completed: boolean) {
    const task = await this.tasks.setCompletion(userId, id, completed);
    if (!task) throw new NotFoundException("Task not found");
    return this.publicTask(task);
  }

  async delete(userId: number, id: number) {
    if (!(await this.tasks.delete(userId, id)))
      throw new NotFoundException("Task not found");
  }

  private publicTask(task: TaskRecord) {
    return {
      id: String(task.id),
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: String(task.userId),
      createdAt: task.createdAt == null ? undefined : String(task.createdAt),
      updatedAt: task.updatedAt == null ? undefined : String(task.updatedAt),
    };
  }
}
