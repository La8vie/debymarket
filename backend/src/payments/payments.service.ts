import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initiatePayment(orderId: string, amount: number) {
    // Dans la réalité, on vérifie la commande en BDD
    // const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    const paymentData = {
      apikey: "VOTRE_CINETPAY_API_KEY", // À mettre dans le .env
      site_id: "VOTRE_CINETPAY_SITE_ID", // À mettre dans le .env
      transaction_id: `DX-${Date.now()}`, // ID unique de transaction
      amount: amount,
      currency: "XOF",
      description: "Paiement Debymarket",
      return_url: "http://localhost:3001/paiement/succes", // URL de retour frontend
      notify_url: "http://localhost:3000/payments/webhook", // URL de notification backend
      customer_name: "Deby",
      customer_surname: "Market",
    };

    // ICI, on ferait un appel API POST à CinetPay pour générer le lien de paiement
    // Exemple avec fetch :
    /*
    const response = await fetch('https://api.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    const result = await response.json();
    return result.data.payment_url; // Lien où le client choisira Orange/MTN/Moov
    */

    // Pour le développement, on simule le lien
    return { 
      message: "Paiement initié", 
      payment_url: "https://client.cinetpay.com/v2/checkout/exemple", 
      transaction_id: paymentData.transaction_id 
    };
  }

  // Webhook appelé par CinetPay quand le client paie
  async handleWebhook(webhookData: any) {
    console.log("Paiement reçu via webhook :", webhookData);
    // Ici, on vérifie la signature de sécurité de CinetPay
    // Puis on met à jour la commande en BDD : status = 'paid'
  }
}