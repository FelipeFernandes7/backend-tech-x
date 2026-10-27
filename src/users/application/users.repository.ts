import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { connectDatabase } from "../../prisma/db";

export interface UserRecord {
  id: number;
  email: string;
  password: string | null;
  name: string | null;
  username: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

@Injectable()
export class UsersRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    await connectDatabase();
    return (await this.prisma.db.orm.public.User.where({
      email,
    }).first()) as UserRecord | null;
  }

  async findById(id: number): Promise<UserRecord | null> {
    await connectDatabase();
    return (await this.prisma.db.orm.public.User.where({
      id,
    }).first()) as UserRecord | null;
  }

  async create(input: {
    email: string;
    password: string;
    name: string;
  }): Promise<UserRecord> {
    await connectDatabase();
    return (await this.prisma.db.orm.public.User.create(input)) as UserRecord;
  }
}
