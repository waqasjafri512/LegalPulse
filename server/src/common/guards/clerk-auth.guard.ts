import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(executionContext: ExecutionContext): Promise<boolean> {
    const request = executionContext.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const decoded = await verifyToken(token, {
        secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
        clockSkewInMs: 60000, // Allow 60 seconds of clock skew
      });

      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      // Inject user and org data into request
      request.user = {
        clerkId: decoded.sub,
        email: decoded.email, // This depends on your Clerk session token claims
        orgId: decoded.org_id, // Custom claim if using Clerk Organizations
      };

      return true;
    } catch (error) {
      console.error('Clerk Auth Error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
