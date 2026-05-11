import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrgsModule } from './modules/orgs/orgs.module';
import { UsersModule } from './modules/users/users.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { MattersModule } from './modules/matters/matters.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { ExtractionModule } from './modules/extraction/extraction.module';
import { WebhooksController } from './modules/webhooks/webhooks.controller';
import { WebhooksService } from './modules/webhooks/webhooks.service';
import { MailModule } from './common/mail/mail.module';
import { SlackModule } from './common/slack/slack.module';
import { GoogleDriveModule } from './modules/integrations/google-drive/google-drive.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
        connectTimeoutMS: 10000,
        extra: {
          connectionTimeoutMillis: 10000,
          idleTimeoutMillis: 30000,
          max: 20,
        },
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASS'),
          tls: {
            rejectUnauthorized: false,
          },
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: null,
        },
      }),
    }),
    ScheduleModule.forRoot(),
    OrgsModule,
    UsersModule,
    ContractsModule,
    MattersModule,
    AlertsModule,
    CloudinaryModule,
    ExtractionModule,
    MailModule,
    SlackModule,
    GoogleDriveModule,
  ],
  controllers: [AppController, WebhooksController],
  providers: [AppService, WebhooksService],
})
export class AppModule {}
