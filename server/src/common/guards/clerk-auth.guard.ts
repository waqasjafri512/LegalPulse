import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken, createClerkClient } from '@clerk/backend';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerkClient;

  constructor(private configService: ConfigService) {
    this.clerkClient = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
    });
  }

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
        clockSkewInMs: 60000,
      });

      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      // Extract orgId from various possible claim locations
      let orgId = (decoded as any).org_id || (decoded as any).o?.id;

      // Fallback: If org_id is missing from JWT, fetch user's memberships
      if (!orgId) {
        try {
          const memberships = await this.clerkClient.users.getOrganizationMembershipList({
            userId: decoded.sub,
          });
          
          if (memberships && memberships.data.length > 0) {
            orgId = memberships.data[0].organization.id;
            console.log(`Fallback: Using first organization found for user ${decoded.sub}: ${orgId}`);
          }
        } catch (err) {
          console.error('Failed to fetch Clerk memberships for fallback:', err.message);
        }
      }

      // Inject user and org data into request
      request.user = {
        clerkId: decoded.sub,
        email: (decoded as any).email,
        orgId: orgId,
      };

      return true;
    } catch (error) {
      console.error('Clerk Auth Error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
