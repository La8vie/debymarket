import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initiatePayment(orderId: string, amount: number, customerName?: string) {
    const transactionId = `DX-${Date.now()}`;

    // S'assurer que la commande existe en BDD pour éviter les erreurs de clé étrangère
    let order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      // Créer un utilisateur temporaire de test si aucun n'existe
      let user = await this.prisma.user.findFirst();
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: 'test@debymarket.com',
            passwordHash: 'dummy_hash',
            role: 'client',
            firstName: 'Client',
            lastName: 'Debymarket',
          }
        });
      }

      // Créer la commande de test en BDD
      const orderNumber = orderId === 'ORDER-TEST-001' ? 'TEST-001' : `ORD-${Date.now()}`;
      order = await this.prisma.order.upsert({
        where: { id: orderId },
        update: {},
        create: {
          id: orderId,
          orderNumber: orderNumber,
          userId: user.id,
          status: 'pending',
          subtotal: amount,
          total: amount,
        }
      });
    }

    const paymentData = {
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: amount,
      currency: 'XOF',
      description: 'Paiement Debymarket',
      return_url: 'http://localhost:3001/cart', // URL de retour frontend
      notify_url: 'https://debymarket-backend.onrender.com/payments/webhook', // L'URL de votre backend Render
      customer_name: customerName || 'Client',
      customer_surname: 'Debymarket',
    };

    try {
      // Appel réel à l'API CinetPay
      const response = await fetch('https://api.cinetpay.com/v2/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      // Si CinetPay accepte, il nous donne le lien de paiement
      if (result.code === '201') {
        // On sauvegarde la transaction en BDD
        await this.prisma.payment.create({
          data: {
            orderId: orderId,
            provider: 'cinetpay',
            transactionId: transactionId,
            status: 'pending',
            amount: amount,
            currency: 'XOF',
          }
        });
        
        // On renvoie le lien de paiement au Frontend
        return { payment_url: result.data.payment_url };
      } else {
        throw new Error(`Erreur CinetPay: ${result.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'initiation CinetPay:", error);
      throw error;
    }
  }

  // Webhook appelé par CinetPay quand le client paie sur son téléphone
  async handleWebhook(webhookData: any) {
    console.log("Notification CinetPay reçue :", webhookData);

    // TODO: Vérifier la signature HMAC de CinetPay pour la sécurité (très important en production)

    if (webhookData.status === 'ACCEPTED') {
      // Le paiement est validé ! On met à jour la BDD
      await this.prisma.payment.update({
        where: { transactionId: webhookData.cpm_trans_id },
        data: { status: 'success', paidAt: new Date() },
      });

      // On met aussi à jour la commande
      // await this.prisma.order.update({ ... })
    }
  }
}