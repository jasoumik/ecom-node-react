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
    // Filter out system/profile images if needed, or rely on folder structure.
    // For now, let's assume profile pics are not added to media_files table unless explicitly uploaded via media manager.
    // But wait, if profile upload uses the same endpoint, it adds to media_files.
    // We should add a 'source' or 'is_system' flag, or just filter by folder.
    // If profile upload doesn't specify folderId, it goes to root.
    // Let's add a filter to exclude files that look like profile pics if we can distinguish them, 
    // OR better: Profile upload should NOT use the general media upload endpoint if we don't want them in the library.
    // But reusing the endpoint is convenient.
    // Let's assume for now that if it's in the root folder, it's visible.
    // If we want to hide profile pics, we should upload them to a specific hidden folder or not record them in media_files.
    
    // Current implementation: All uploads via /media/upload go to media_files.
    // To hide profile pics, we can add a 'is_hidden' column or similar.
    // For this request, I'll filter out files that are not associated with a folder if we want to keep root clean, 
    // OR we can just accept that they are there.
    
    // The user said "Media Library should not have the images that uploaded in profile pic".
    // This implies profile pics are cluttering the library.
    // I will modify the upload endpoint to accept a 'context' param, and if context is 'profile', mark it as hidden or don't save to media_files DB (just return URL).
    
    return query;
  }

  async saveFileRecord(file: Express.Multer.File, folderId?: string, context?: string): Promise<any> {
    const url = `/uploads/${file.filename}`; 

    // If context is profile, we might not want to save it to the media library DB to keep it clean.
    // Or we save it with a flag.
    // Let's choose to NOT save to DB if context is 'profile', just return the URL.
    if (context === 'profile') {
        return { url };
    }

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
  }
}
