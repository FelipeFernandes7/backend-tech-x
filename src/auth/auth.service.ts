import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { UsersRepository } from "../users/application/users.repository";
import { LoginDto, RegisterDto } from "./presentation/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersRepository) private readonly users: UsersRepository,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const email = input.email.trim().toLowerCase();
    if (await this.users.findByEmail(email))
      throw new ConflictException("Email already registered");

    const password = await bcrypt.hash(input.password, 12);
    const user = await this.users.create({
      email,
      password,
      name: input.name.trim(),
    });
    return { user: this.publicUser(user), accessToken: await this.sign(user) };
  }

  async login(input: LoginDto) {
    const email = input.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (
      !user?.password ||
      !(await bcrypt.compare(input.password, user.password))
    ) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return { user: this.publicUser(user), accessToken: await this.sign(user) };
  }

  async me(id: number) {
    const user = await this.users.findById(id);
    if (!user) throw new UnauthorizedException("User not found");
    return this.publicUser(user);
  }

  private sign(user: { id: number; email: string; name: string | null }) {
    return this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name ?? "",
    });
  }

  private publicUser(user: {
    id: number;
    email: string;
    name: string | null;
    createdAt: unknown;
  }) {
    return {
      id: String(user.id),
      email: user.email,
      name: user.name ?? "",
      createdAt: user.createdAt == null ? undefined : String(user.createdAt),
    };
  }
}
