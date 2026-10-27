import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { UsersRepository } from "./application/users.repository";

@Module({
  providers: [UsersRepository, PrismaService],
  exports: [UsersRepository],
})
export class UsersModule {}
