import { Injectable } from '@nestjs/common';
import { IIremboPayClient, IremboPaymentRequest, IremboPaymentResponse } from './irembo-pay.interface';
import { v4 as uuid } from 'uuid';

@Injectable()
export class IremboPayClient implements IIremboPayClient {
    async generateBatchInvoice(totalAmount: number, description: string): Promise<{ billId: string }> {
        console.log(`[IremboPay Mock] Generating invoice for RWF ${totalAmount}`);
        return { billId: `IREMBO-${Math.floor(Math.random() * 100000)}` };
    }

    async initiatePayment(request: IremboPaymentRequest): Promise<IremboPaymentResponse> {
        console.log(`[IremboPay Mock] Initiating payment for ${request.billId} to ${request.recipientAccount}`);
        
        return new Promise(resolve => 
            setTimeout(() => {
                resolve({
                    status: 'SUCCESS',
                    transactionRef: uuid(),
                    message: 'Payment simulated successfully.',
                });
            }, 500)
        );
    }
    
    async simulateWebhook(billId: string, status: 'SUCCESS' | 'FAILED'): Promise<boolean> {
        console.log(`[IremboPay Mock] Webhook received for Bill ID ${billId} with status: ${status}`);
        return status === 'SUCCESS';
    }
}