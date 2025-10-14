import { Module } from '@nestjs/common';
import { IremboPayClient } from './irembo-pay.client';

@Module({
    providers: [IremboPayClient],
    exports: [IremboPayClient],
})
export class IremboPayModule {}