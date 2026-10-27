import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

interface JwtPayload {
  sub: number;
  email: string;
  name?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      cookies?: Record<string, string | undefined>;
      user?: { id: number; email: string; name: string };
    }>();

    const authorization = request.headers.authorization;
    const bearer =
      typeof authorization === "string"
        ? authorization.replace(/^Bearer\s+/i, "")
        : undefined;
    const token =
      bearer && bearer !== authorization
        ? bearer
        : request.cookies?.access_token;

    if (!token) throw new UnauthorizedException("Authentication required");

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      if (!Number.isInteger(payload.sub))
        throw new Error("Invalid subject claim");
      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name ?? "",
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
