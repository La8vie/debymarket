import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NotificationService } from './notification.service';
import { AdminNotificationService } from './admin-notification.service';
import { PromotionNotificationService } from './promotion-notification.service';
import { AdminNotificationController } from './admin-notification.controller';
import { PromotionNotificationController } from './promotion-notification.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret_key_by_default_for_dev',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    NotificationService,
    AdminNotificationService,
    PromotionNotificationService,
  ],
  controllers: [AdminNotificationController, PromotionNotificationController],
  exports: [
    NotificationService,
    AdminNotificationService,
    PromotionNotificationService,
  ],
})
export class NotificationModule {}
