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

  async saveFileRecord(file: Express.Multer.File, folderId?: string, context?: string): Promise<any> {
    const url = `/uploads/${file.filename}`; 

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

  async moveFile(id: string, folderId: string): Promise<void> {
    await this.knex('media_files').where({ id }).update({ folder_id: folderId });
  }
}
