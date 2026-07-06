import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PromotionNotificationService } from './promotion-notification.service';

@Controller('notifications')
export class PromotionNotificationController {
  constructor(
    private readonly promotionNotificationService: PromotionNotificationService,
  ) {}

  @Post('promotions')
  async sendPromotionNotification(
    @Body()
    payload: {
      promotionId: string;
      title: string;
      message: string;
      discountPercent?: number;
      validUntil?: string;
      imageUrl?: string;
    },
  ) {
    const parsedPayload = {
      ...payload,
      validUntil: payload.validUntil ? new Date(payload.validUntil) : undefined,
    };
    return this.promotionNotificationService.sendPromotionNotification(
      parsedPayload,
    );
  }

  @Put('preferences/:userId')
  async updatePreferences(
    @Param('userId') userId: string,
    @Body()
    preferences: {
      emailPromotions?: boolean;
      emailOrderUpdates?: boolean;
      smsPromotions?: boolean;
      smsOrderUpdates?: boolean;
      notificationFrequency?: 'daily' | 'weekly' | 'monthly';
    },
  ) {
    return this.promotionNotificationService.updatePreferences(
      userId,
      preferences,
    );
  }

  @Get('preferences/:userId')
  async getPreferences(@Param('userId') userId: string) {
    return this.promotionNotificationService.getPreferences(userId);
  }

  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string) {
    return this.promotionNotificationService.getUserNotifications(userId);
  }

  @Put('user/:userId/read/:notificationId')
  async markNotificationAsRead(
    @Param('userId') userId: string,
    @Param('notificationId') notificationId: string,
  ) {
    return this.promotionNotificationService.markNotificationAsRead(
      notificationId,
    );
  }

  @Delete('user/:userId/:notificationId')
  async deleteNotification(
    @Param('userId') userId: string,
    @Param('notificationId') notificationId: string,
  ) {
    return this.promotionNotificationService.deleteNotification(notificationId);
  }
}
