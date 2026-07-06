import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

interface PromotionEmailPayload {
  promotionId: string;
  title: string;
  message: string;
  discountPercent?: number;
  validUntil?: Date;
  imageUrl?: string;
}

@Injectable()
export class PromotionNotificationService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Envoyer une notification de promotion aux clients
   * Respecte les préférences de notification et la fréquence
   */
  async sendPromotionNotification(payload: PromotionEmailPayload) {
    try {
      // Récupérer les utilisateurs avec les préférences de notification
      const users = await this.prisma.user.findMany({
        where: {
          isEmailVerified: true, // Seulement les utilisateurs vérifiés
          notificationPrefs: {
            emailPromotions: true,
          },
        },
        include: {
          notificationPrefs: true,
        },
      });

      console.log(`Envoi de promotion à ${users.length} utilisateurs`);

      // Vérifier la fréquence de notification et envoyer
      for (const user of users) {
        try {
          // Vérifier s'il a reçu trop de notifications récemment
          const recentNotifications = await this.prisma.notification.count({
            where: {
              userId: user.id,
              type: 'promotion',
              createdAt: {
                gte: this.getFrequencyDate(
                  user.notificationPrefs?.notificationFrequency || 'weekly',
                ),
              },
            },
          });

          // Si fréquence daily: max 2 par jour, weekly: max 5 par semaine, monthly: max 10 par mois
          const maxNotifications = {
            daily: 2,
            weekly: 5,
            monthly: 10,
          };

          const currentFreq =
            (user.notificationPrefs
              ?.notificationFrequency as keyof typeof maxNotifications) ||
            'weekly';
          const max = maxNotifications[currentFreq];

          if (recentNotifications >= max) {
            console.log(
              `Utilisateur ${user.email} a atteint la limite de notifications`,
            );
            continue;
          }

          // Envoyer l'email de promotion
          await this.notificationService.sendPromotionEmail(
            user.email,
            user.firstName || 'Utilisateur',
            payload.title,
            payload.message,
          );

          // Envoyer SMS si préféré et téléphone vérifié
          if (
            user.isPhoneVerified &&
            user.notificationPrefs?.smsPromotions &&
            user.phone
          ) {
            try {
              await this.notificationService.sendPromotionSMS(
                user.phone,
                payload.title,
                payload.discountPercent,
              );
            } catch (error) {
              console.warn(
                `Erreur lors de l'envoi du SMS à ${user.phone}:`,
                error,
              );
            }
          }

          // Créer une notification dans la BDD
          await this.prisma.notification.create({
            data: {
              userId: user.id,
              type: 'promotion',
              title: payload.title,
              message: payload.message,
              data: {
                promotionId: payload.promotionId,
                discountPercent: payload.discountPercent,
                validUntil: payload.validUntil,
              },
            },
          });
        } catch (error) {
          console.error(`Erreur lors de l'envoi à ${user.email}:`, error);
        }
      }

      return {
        success: true,
        sentTo: users.length,
        message: 'Notifications de promotion envoyées',
      };
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi des notifications de promotion:",
        error,
      );
      throw error;
    }
  }

  /**
   * Envoyer un SMS de promotion
   */
  /**
   * Obtenir la date limite en fonction de la fréquence
   */
  private getFrequencyDate(frequency: string): Date {
    const now = new Date();

    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7j
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30j
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7j par défaut
    }
  }

  /**
   * Mettre à jour les préférences de notification d'un utilisateur
   */
  async updatePreferences(
    userId: string,
    preferences: {
      emailPromotions?: boolean;
      emailOrderUpdates?: boolean;
      smsPromotions?: boolean;
      smsOrderUpdates?: boolean;
      notificationFrequency?: 'daily' | 'weekly' | 'monthly';
    },
  ) {
    const existing = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (existing) {
      return this.prisma.notificationPreference.update({
        where: { userId },
        data: preferences,
      });
    } else {
      return this.prisma.notificationPreference.create({
        data: {
          userId,
          ...preferences,
        },
      });
    }
  }

  /**
   * Récupérer les préférences de notification d'un utilisateur
   */
  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
  }

  /**
   * Lister les notifications d'un utilisateur
   */
  async getUserNotifications(userId: string, limit: number = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Marquer une notification comme lue
   */
  async markNotificationAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}
