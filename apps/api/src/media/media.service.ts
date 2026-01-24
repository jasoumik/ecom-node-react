import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateFolderDto } from './dto/create-folder.dto';

@Injectable()
export class MediaService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async getFolders(parentId?: string): Promise<any[]> {
    const query = this.knex('media_folders').select('*');
    if (parentId) {
      query.where({ parent_id: parentId });
    } else {
      query.whereNull('parent_id');
    }
    return query;
  }

  async createFolder(createFolderDto: CreateFolderDto): Promise<any> {
    const [folder] = await this.knex('media_folders').insert(createFolderDto).returning('*');
    return folder;
  }

  async deleteFolder(id: string): Promise<void> {
    await this.knex('media_folders').where({ id }).delete();
  }

  async getFiles(folderId?: string): Promise<any[]> {
    const query = this.knex('media_files').select('*');
    if (folderId) {
      query.where({ folder_id: folderId });
    } else {
      query.whereNull('folder_id');
    }
    return query;
  }

  async saveFileRecord(file: Express.Multer.File, folderId?: string): Promise<any> {
    // In a real app, upload to S3/Cloudinary here and get URL.
    // For local dev, we'll assume it's served statically or just mock the URL.
    // Since we don't have S3 setup, let's mock a URL or use a local path if we set up static serving.
    // For simplicity in this demo, let's assume we upload to a public folder or just use a placeholder if no actual upload logic is implemented yet.
    // But wait, the user asked for "uploader".
    
    // I will implement a basic local file save logic if needed, or just store the metadata assuming the controller handles the physical file.
    // Let's assume the controller passes the file object which contains info.
    
    // Mock URL for now as we don't have static file serving configured in main.ts yet.
    // I'll add static serving in main.ts later.
    const url = `/uploads/${file.filename}`; 

    const [mediaFile] = await this.knex('media_files').insert({
      name: file.originalname,
      url: url,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      mime_type: file.mimetype,
      size: file.size,
      folder_id: folderId || null,
    }).returning('*');

    return mediaFile;
  }

  async deleteFile(id: string): Promise<void> {
    await this.knex('media_files').where({ id }).delete();
    // Should also delete physical file
  }
}
