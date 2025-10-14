export interface IremboPaymentRequest {
    billId: string;
    amount: number;
    currency: 'RWF' | 'USD';
    recipientAccount: string;
    description: string;
}

export interface IremboPaymentResponse {
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    transactionRef: string;
    message: string;
}

export interface IIremboPayClient {
    generateBatchInvoice(totalAmount: number, description: string): Promise<{ billId: string }>;
    initiatePayment(request: IremboPaymentRequest): Promise<IremboPaymentResponse>;
    simulateWebhook(billId: string, status: 'SUCCESS' | 'FAILED'): Promise<boolean>;
}