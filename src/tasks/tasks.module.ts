import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma.service";
import { TasksRepository } from "./application/tasks.repository";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [AuthModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository, PrismaService],
})
export class TasksModule {}
