import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { connectDatabase } from "../../prisma/db";

export interface TaskRecord {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  userId: number;
  createdAt: unknown;
  updatedAt: unknown;
}

@Injectable()
export class TasksRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll(userId: number): Promise<TaskRecord[]> {
    await connectDatabase();
    return (await this.prisma.db.orm.public.Task.where({
      userId,
    }).all()) as TaskRecord[];
  }

  async findOne(userId: number, id: number): Promise<TaskRecord | null> {
    await connectDatabase();
    return (await this.prisma.db.orm.public.Task.where({
      id,
      userId,
    }).first()) as TaskRecord | null;
  }

  async create(
    userId: number,
    input: { title: string; description?: string },
  ): Promise<TaskRecord> {
    await connectDatabase();
    return (await this.prisma.db.orm.public.Task.create({
      ...input,
      completed: false,
      userId,
    })) as TaskRecord;
  }

  async update(
    userId: number,
    id: number,
    input: { title?: string; description?: string },
  ): Promise<TaskRecord | null> {
    await connectDatabase();
    if (!(await this.findOne(userId, id))) return null;
    return (await this.prisma.db.orm.public.Task.where({ id, userId })
      .select(
        "id",
        "title",
        "description",
        "completed",
        "userId",
        "createdAt",
        "updatedAt",
      )
      .update(input)) as TaskRecord;
  }

  async setCompletion(
    userId: number,
    id: number,
    completed: boolean,
  ): Promise<TaskRecord | null> {
    await connectDatabase();
    if (!(await this.findOne(userId, id))) return null;
    return (await this.prisma.db.orm.public.Task.where({ id, userId })
      .select(
        "id",
        "title",
        "description",
        "completed",
        "userId",
        "createdAt",
        "updatedAt",
      )
      .update({ completed })) as TaskRecord;
  }

  async delete(userId: number, id: number): Promise<boolean> {
    await connectDatabase();
    if (!(await this.findOne(userId, id))) return false;
    await this.prisma.db.orm.public.Task.where({ id, userId }).delete();
    return true;
  }
}
