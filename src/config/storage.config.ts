import { join } from 'path';
import { ensureDirSync } from 'fs-extra';

export const STORAGE_CONFIG = {
  // Base directory for storage
  root: join(process.cwd(), 'storage'),
  
  // Subdirectories for different types of files
  directories: {
    documents: 'documents',
    contracts: 'contracts',
    policies: 'policies',
    templates: 'templates',
    avatars: 'avatars',
  },
  
  // Initialize storage directories
  initialize: () => {
    // Ensure root directory exists
    ensureDirSync(STORAGE_CONFIG.root);
    
    // Ensure all subdirectories exist
    (Object.values(STORAGE_CONFIG.directories) as string[]).forEach(dir => {
      ensureDirSync(join(STORAGE_CONFIG.root, dir));
    });
    
    console.log('Storage directories initialized');
  },
  
  // Get full path for a file
  getPath: (category: keyof typeof STORAGE_CONFIG.directories, filename: string): string => {
    return join(STORAGE_CONFIG.root, STORAGE_CONFIG.directories[category], filename);
  },
  
  // Generate a unique filename
  generateFilename: (originalname: string): string => {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 10);
    const extension = String(originalname.split('.').pop());
    return `${timestamp}-${randomString}.${extension}`;
  },
};

// Initialize storage on import
STORAGE_CONFIG.initialize();

export default STORAGE_CONFIG;
