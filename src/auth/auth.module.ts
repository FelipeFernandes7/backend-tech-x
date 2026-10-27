import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "../prisma.service";
import { UsersRepository } from "../users/application/users.repository";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./presentation/jwt-auth.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret || secret === "replace-with-a-long-random-secret") {
          if (process.env.NODE_ENV === "production")
            throw new Error("JWT_SECRET must be configured in production");
        }
        return secret ?? "development-only-secret-change-before-production";
      })(),
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? "24h") as any },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, PrismaService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
