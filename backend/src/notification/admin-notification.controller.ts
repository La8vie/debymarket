import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Res,
  UseGuards,
  Body,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import type { Prisma } from '@prisma/client';
import { AdminNotificationService } from './admin-notification.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

interface JwtUserPayload {
  userId?: string;
  sub?: string;
  id?: string;
  role?: string;
}

interface AdminNotificationPayload {
  type:
    | 'new_order'
    | 'low_stock'
    | 'user_registration'
    | 'payment_completed'
    | 'test';
  title?: string;
  message?: string;
  orderId?: string;
  data?: Prisma.InputJsonValue | null;
}

@Controller('admin/notifications')
export class AdminNotificationController {
  constructor(
    private readonly adminNotificationService: AdminNotificationService,
  ) {}

  /**
   * Endpoint SSE pour les notifications en temps réel
   */
  @Get('subscribe')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async subscribe(@Req() req: Request, @Res() res: Response) {
    const rawUser = (req as Request & { user?: JwtUserPayload }).user;
    const adminId = rawUser?.userId || rawUser?.sub || rawUser?.id || 'admin-1';

    // Configurer les headers SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.FRONTEND_URL || '*',
    );
    res.flushHeaders();
    res.write(': connected\n\n');

    // S'abonner aux notifications
    const callback = (notification: Record<string, unknown>) => {
      try {
        res.write(`data: ${JSON.stringify(notification)}\n\n`);
      } catch (error: unknown) {
        console.error('Erreur SSE en écrivant la notification:', error);
      }
    };

    this.adminNotificationService.subscribe(adminId, callback);

    // Garder la connexion ouverte
    const interval = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (error: unknown) {
        // Ignorer les erreurs si la connexion est déjà fermée.
      }
    }, 30000); // Heartbeat toutes les 30s

    const cleanup = () => {
      clearInterval(interval);
      this.adminNotificationService.unsubscribe(adminId, callback);
      res.end();
    };

    res.on('close', cleanup);
    req.on('close', cleanup);
  }

  /**
   * Récupérer toutes les notifications
   */
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  getAll() {
    return this.adminNotificationService.getAllNotifications();
  }

  /**
   * Récupérer les notifications non lues
   */
  @Get('unread')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  getUnread() {
    return this.adminNotificationService.getUnreadNotifications();
  }

  /**
   * Marquer une notification comme lue
   */
  @Put(':id/read')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  markAsRead(@Param('id') id: string) {
    return this.adminNotificationService.markAsRead(id);
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  @Post('read-all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  markAllAsRead() {
    return this.adminNotificationService.markAllAsRead();
  }

  /**
   * Supprimer une notification
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.adminNotificationService.deleteNotification(id);
  }

  /**
   * Endpoint de test: pousser une notification admin (utilitaire pour tests SSE)
   */
  @Post('push')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async pushNotification(@Body() payload: AdminNotificationPayload) {
    return this.adminNotificationService.notifyAdmin({
      type: payload.type || 'test',
      title: payload.title || 'Notification de test',
      message: payload.message || '',
      orderId: payload.orderId,
      data: payload.data === null ? undefined : payload.data,
    });
  }

  /**
   * Endpoint local de test: diffuse une notification en mémoire sans l'enregistrer en BDD
   */
  @Post('push-local')
  pushLocalNotification(@Body() payload: AdminNotificationPayload) {
    const notification: Record<string, unknown> = {
      id: `tmp-${Date.now()}`,
      type: payload.type || 'test',
      title: payload.title || 'Notification de test',
      message: payload.message || '',
      orderId: payload.orderId || null,
      data: payload.data || null,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    return this.adminNotificationService.broadcastToSubscribers(notification);
  }
}
