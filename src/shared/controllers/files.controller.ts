import { Controller, Get, Param, Res, StreamableFile, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { STORAGE_CONFIG } from '../../config/storage.config';

@Controller('files')
export class FilesController {
  @Get(':category/:filename')
  getFile(
    @Param('category') category: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const filePath = join(STORAGE_CONFIG.root, category, filename);
    
    try {
      const file = createReadStream(filePath);
      
      // Set appropriate headers
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      });
      
      return new StreamableFile(file);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
}
