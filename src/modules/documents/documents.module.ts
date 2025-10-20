import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { Policy } from './entities/policy.entity';
import { PolicyAcknowledgment } from './entities/policy-acknowledgment.entity';
import { Contract } from './entities/contract.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      Policy,
      PolicyAcknowledgment,
      Contract,
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
