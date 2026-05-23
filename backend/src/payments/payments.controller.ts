import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import type { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  async initiatePayment(@Body() body: { orderId: string; amount: number; customerName?: string }) {
    return this.paymentsService.initiatePayment(body.orderId, body.amount, body.customerName);
  }

  // Route publique pour recevoir les webhooks de CinetPay (pas de JWT)
  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    await this.paymentsService.handleWebhook(req.body);
    // Il faut TOUJOURS répondre 200 à CinetPay pour lui dire qu'on a bien reçu
    res.status(HttpStatus.OK).send('OK');
  }
}