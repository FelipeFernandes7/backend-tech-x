import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/presentation/jwt-auth.guard";
import {
  CurrentUser,
  type AuthenticatedUser,
} from "../auth/presentation/current-user.decorator";
import {
  CompletionDto,
  CreateTaskDto,
  UpdateTaskDto,
} from "./presentation/task.dto";
import { TasksService } from "./tasks.service";

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(@Inject(TasksService) private readonly tasks: TasksService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.tasks.list(user.id);
  }

  @Get(":id")
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.tasks.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateTaskDto) {
    return this.tasks.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTaskDto,
  ) {
    return this.tasks.update(user.id, id, body);
  }

  @Patch(":id/completion")
  completion(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: CompletionDto,
  ) {
    return this.tasks.setCompletion(user.id, id, body.completed);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
  ) {
    await this.tasks.delete(user.id, id);
  }
}
