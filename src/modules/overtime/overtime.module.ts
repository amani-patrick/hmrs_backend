import { Module } from '@nestjs/common';
import { OvertimeController } from './overtime.controller';

@Module({
  controllers: [OvertimeController],
  exports: []
})
export class OvertimeModule {}
