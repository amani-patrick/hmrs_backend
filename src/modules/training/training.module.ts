import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { trainingProviders } from './training.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [TrainingController],
  providers: [TrainingService, ...trainingProviders],
  exports: [TrainingService],
})
export class TrainingModule {}
