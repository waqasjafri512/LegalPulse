import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private orgsService: OrgsService,
  ) {}

  async processClerkEvent(payload: string, headers: any) {
    const secret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.error('CLERK_WEBHOOK_SECRET is not set');
      throw new BadRequestException('Webhook secret not configured');
    }

    const wh = new Webhook(secret);
    let evt: any;

    try {
      evt = wh.verify(payload, headers);
    } catch (err) {
      this.logger.error('Webhook verification failed', err.message);
      throw new BadRequestException('Invalid signature');
    }

    const { type, data } = evt;
    this.logger.log(`Received Clerk webhook event: ${type}`);

    switch (type) {
      case 'user.created':
        await this.handleUserCreated(data);
        break;
      case 'user.updated':
        await this.handleUserUpdated(data);
        break;
      case 'organization.created':
        await this.handleOrgCreated(data);
        break;
      case 'organization.updated':
        await this.handleOrgUpdated(data);
        break;
      default:
        this.logger.warn(`Unhandled event type: ${type}`);
    }

    return { success: true };
  }

  private async handleUserCreated(data: any) {
    const email = data.email_addresses[0]?.email_address;
    const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    
    // Note: In a real app, you might want to wait for organization.created
    // or use a default personal organization.
    await this.usersService.create({
      clerkUserId: data.id,
      email,
      fullName,
      orgId: data.public_metadata?.orgId || null, // Optional orgId
    });
  }

  private async handleUserUpdated(data: any) {
    const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    await this.usersService.update(data.id, {
      full_name: fullName,
    });
  }

  private async handleOrgCreated(data: any) {
    await this.orgsService.create({
      clerkOrgId: data.id,
      name: data.name,
    });
  }

  private async handleOrgUpdated(data: any) {
    await this.orgsService.update(data.id, {
      name: data.name,
    });
  }
}
