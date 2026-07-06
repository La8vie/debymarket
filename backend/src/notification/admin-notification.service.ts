import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import { EventEmitter } from 'events';

interface AdminNotificationPayload {
  type:
    | 'new_order'
    | 'low_stock'
    | 'user_registration'
    | 'payment_completed'
    | 'test';
  title: string;
  message: string;
  orderId?: string;
  data?: Prisma.InputJsonValue;
}

@Injectable()
export class AdminNotificationService implements OnModuleInit {
  private readonly notificationEmitter = new EventEmitter();

  constructor(private prisma: PrismaService) {
    this.notificationEmitter.setMaxListeners(0);
  }

  onModuleInit() {
    console.log('AdminNotificationService initialized');
  }

  /**
   * S'abonner aux notifications admin
   */
  subscribe(adminId: string, callback: (notification: any) => void) {
    this.notificationEmitter.on('notification', callback);
  }

  /**
   * Se désabonner des notifications
   */
  unsubscribe(adminId: string, callback: (notification: any) => void) {
    this.notificationEmitter.off('notification', callback);
  }

  /**
   * Envoyer une notification admin
   */
  async notifyAdmin(payload: AdminNotificationPayload) {
    try {
      const notification = await this.prisma.adminNotification.create({
        data: {
          type: payload.type,
          title: payload.title,
          message: payload.message,
          orderId: payload.orderId,
          data: payload.data ? JSON.stringify(payload.data) : null,
        },
      });

      this.notificationEmitter.emit('notification', notification);

      console.log(`Notification admin créée: ${payload.type}`);
      return notification;
    } catch (error: unknown) {
      console.error(
        'Erreur lors de la création de la notification admin:',
        error,
      );
      if (error instanceof Error) throw error;
      throw new Error('Erreur interne lors de la création de notification');
    }
  }

  /**
   * Diffuse une notification directement aux abonnés en mémoire (sans persistance DB)
   * Utile pour les tests/dev quand la DB n'est pas disponible
   */
  broadcastToSubscribers(notification: Record<string, unknown>) {
    this.notificationEmitter.emit('notification', notification);
    return notification;
  }

  /**
   * Créer une notification pour une nouvelle commande
   */
  async notifyNewOrder(orderId: string, customerName: string, total: number) {
    return this.notifyAdmin({
      type: 'new_order',
      title: `Nouvelle commande de ${customerName}`,
      message: `Une commande de ${total} XOF a été créée`,
      orderId: orderId,
      data: {
        customerName,
        total,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Créer une notification pour un stock faible
   */
  async notifyLowStock(
    productName: string,
    currentStock: number,
    threshold: number,
  ) {
    return this.notifyAdmin({
      type: 'low_stock',
      title: `Stock faible: ${productName}`,
      message: `Le stock de "${productName}" est passé en dessous de ${threshold} unités (actuellement: ${currentStock})`,
      data: {
        productName,
        currentStock,
        threshold,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Créer une notification pour une nouvelle inscription
   */
  async notifyNewRegistration(userEmail: string, userName: string) {
    return this.notifyAdmin({
      type: 'user_registration',
      title: `Nouvel utilisateur: ${userName}`,
      message: `Un nouvel utilisateur s'est inscrit: ${userEmail}`,
      data: {
        userEmail,
        userName,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Récupérer toutes les notifications admin
   */
  async getAllNotifications(limit: number = 50) {
    return this.prisma.adminNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Récupérer les notifications non lues
   */
  async getUnreadNotifications() {
    return this.prisma.adminNotification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string) {
    return this.prisma.adminNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead() {
    return this.prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string) {
    return this.prisma.adminNotification.delete({
      where: { id: notificationId },
    });
  }
}
