import { Module } from '@nestjs/common';
import { FileUploadService } from './services/file-upload.service';
import { FilesController } from './controllers/files.controller';

@Module({
  controllers: [FilesController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class SharedModule {}
