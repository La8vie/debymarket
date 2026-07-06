import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import twilio from 'twilio';

@Injectable()
export class NotificationService {
  private emailTransport: nodemailer.Transporter;
  private twilioClient?: ReturnType<typeof twilio>;

  constructor(private configService: ConfigService) {
    // Configuration Nodemailer pour email
    this.emailTransport = nodemailer.createTransport({
      service: this.configService.get<string>('MAIL_SERVICE', 'gmail'),
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });

    // Configuration Twilio pour SMS
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  /**
   * Envoyer un email de vérification
   */
  async sendVerificationEmail(
    email: string,
    token: string,
    userName: string,
  ): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>(
        'MAIL_FROM',
        'noreply@debymarket.com',
      ),
      to: email,
      subject: 'Vérification de votre email - DebyMarket',
      html: `
        <h2>Bonjour ${userName},</h2>
        <p>Merci de créer un compte chez DebyMarket!</p>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre email:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Vérifier mon email
        </a>
        <p>Le lien expire dans 24 heures.</p>
        <p>DebyMarket Team</p>
      `,
    };

    try {
      await this.emailTransport.sendMail(mailOptions);
    } catch (error: unknown) {
      console.error("Erreur lors de l'envoi du mail de vérification:", error);
      if (error instanceof Error) throw error;
      throw new Error("Erreur lors de l'envoi du mail de vérification");
    }
  }

  /**
   * Envoyer un SMS de vérification
   */
  async sendVerificationSMS(phone: string, token: string): Promise<void> {
    // Mode développement: ne pas échouer si Twilio n'est pas configuré
    if (!this.twilioClient) {
      console.warn('Twilio not configured, skipping SMS in dev mode');
      return;
    }

    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-phone?token=${token}`;
    const message = `DebyMarket: Voici votre code de vérification: ${token}. Ne le partagez pas. ${verificationUrl}`;

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: phone,
      });
    } catch (error: unknown) {
      console.error("Erreur lors de l'envoi du SMS de vérification:", error);
      if (error instanceof Error) throw error;
      throw new Error('Erreur lors de l envoi du SMS de vérification');
    }
  }

  async sendPromotionSMS(
    phone: string,
    title: string,
    discountPercent?: number,
  ): Promise<void> {
    if (!this.twilioClient) {
      throw new Error('Twilio not configured');
    }

    const discountText = discountPercent
      ? `${discountPercent}% de réduction - `
      : '';
    const message = `DebyMarket: ${discountText}${title}. Découvrez nos offres spéciales !`;

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: phone,
      });
    } catch (error: unknown) {
      console.error("Erreur lors de l'envoi du SMS de promotion:", error);
      if (error instanceof Error) throw error;
      throw new Error('Erreur lors de l envoi du SMS de promotion');
    }
  }

  /**
   * Envoyer un email de notification de commande
   */
  async sendOrderConfirmationEmail(
    email: string,
    userName: string,
    orderNumber: string,
    orderTotal: number,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>(
        'MAIL_FROM',
        'noreply@debymarket.com',
      ),
      to: email,
      subject: `Confirmation de commande #${orderNumber} - DebyMarket`,
      html: `
        <h2>Bonjour ${userName},</h2>
        <p>Merci pour votre commande!</p>
        <p><strong>Numéro de commande:</strong> ${orderNumber}</p>
        <p><strong>Total:</strong> ${orderTotal} XOF</p>
        <p>Vous recevrez un email de suivi dès que votre commande sera expédiée.</p>
        <a href="${this.configService.get<string>('FRONTEND_URL')}/orders/${orderNumber}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Suivre ma commande
        </a>
        <p>DebyMarket Team</p>
      `,
    };

    try {
      await this.emailTransport.sendMail(mailOptions);
    } catch (error: unknown) {
      console.error("Erreur lors de l'envoi du mail de confirmation:", error);
      if (error instanceof Error) throw error;
      throw new Error('Erreur lors de l envoi du mail de confirmation');
    }
  }

  /**
   * Envoyer une notification de promotion
   */
  async sendPromotionEmail(
    email: string,
    userName: string,
    promotionTitle: string,
    promotionMessage: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>(
        'MAIL_FROM',
        'noreply@debymarket.com',
      ),
      to: email,
      subject: `${promotionTitle} - DebyMarket`,
      html: `
        <h2>Bonjour ${userName},</h2>
        <p>${promotionMessage}</p>
        <a href="${this.configService.get<string>('FRONTEND_URL')}" style="background-color: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Voir les produits
        </a>
        <p>DebyMarket Team</p>
      `,
    };

    try {
      await this.emailTransport.sendMail(mailOptions);
    } catch (error: unknown) {
      console.error("Erreur lors de l'envoi du mail de promotion:", error);
      if (error instanceof Error) throw error;
      throw new Error('Erreur lors de l envoi du mail de promotion');
    }
  }

  /**
   * Envoyer un SMS de promotion
   */
  /**
   * Vérifier si une adresse email est valide
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Vérifier si un numéro de téléphone est valide (format international)
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}
