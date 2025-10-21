/* eslint-disable @typescript-eslint/require-await */
import { Injectable, BadRequestException } from '@nestjs/common';
import { createReadStream, createWriteStream, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { pipeline, Readable } from 'stream';
import * as fs from 'fs-extra';
import { STORAGE_CONFIG } from '../../config/storage.config';

const pump = promisify(pipeline);

// Define Multer file type
type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  stream: Readable;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
};

@Injectable()
export class FileUploadService {
  async uploadFile(
    file: MulterFile,
    category: keyof typeof STORAGE_CONFIG.directories,
    customFilename?: string,
  ): Promise<{ filename: string; path: string; url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Generate a unique filename if not provided
    const filename = customFilename || STORAGE_CONFIG.generateFilename(String(file.originalname));
    const filePath = STORAGE_CONFIG.getPath(category, filename);
    
    // Ensure the directory exists
    const dirPath = join(STORAGE_CONFIG.root, STORAGE_CONFIG.directories[category]);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirpSync(dirPath);
    }

    // Save the file
    const writeStream = createWriteStream(filePath);
    await pump(file.stream, writeStream);

    return {
      filename,
      path: filePath,
      url: `/files/${String(category)}/${filename}`,
    };
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      return false;
    }
  }

  async readFile(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const readStream = createReadStream(filePath);
      
      readStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      readStream.on('error', reject);
      readStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  getFileStream(filePath: string) {
    if (!existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }
    return createReadStream(filePath);
  }
}
