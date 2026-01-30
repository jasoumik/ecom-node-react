import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateFolderDto } from './dto/create-folder.dto';
import { join, basename } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';

@Injectable()
export class MediaService {
  private readonly UPLOADS_PATH: string;

  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {
    // ✅ Absolute upload path based on environment
    this.UPLOADS_PATH =
        process.env.NODE_ENV === 'production'
            ? '/var/www/uploads'
            : join(process.cwd(), 'uploads');

    // ✅ Ensure uploads folder exists
    if (!existsSync(this.UPLOADS_PATH)) {
      mkdirSync(this.UPLOADS_PATH, { recursive: true });
    }
  }

  getUploadPath() {
    return this.UPLOADS_PATH;
  }

  /* -------------------- FOLDERS -------------------- */

  async getFolders(parentId?: string): Promise<any[]> {
    const query = this.knex('media_folders').select('*');
    parentId ? query.where({ parent_id: parentId }) : query.whereNull('parent_id');
    return query;
  }

  async createFolder(createFolderDto: CreateFolderDto): Promise<any> {
    const [folder] = await this.knex('media_folders').insert(createFolderDto).returning('*');
    return folder;
  }

  async deleteFolder(id: string): Promise<void> {
    await this.knex('media_folders').where({ id }).delete();
  }

  /* -------------------- FILES -------------------- */

  async getFiles(folderId?: string): Promise<any[]> {
    const query = this.knex('media_files').select('*');
    folderId ? query.where({ folder_id: folderId }) : query.whereNull('folder_id');
    return query;
  }

  async saveFileRecord(file: Express.Multer.File, folderId?: string, context?: string): Promise<any> {
    const filePath = join(this.UPLOADS_PATH, file.filename);

    if (!existsSync(filePath) && file.buffer) {
      writeFileSync(filePath, file.buffer);
    }

    const url = `/uploads/${file.filename}`;

    if (context === 'profile') {
      return { url };
    }

    const [mediaFile] = await this.knex('media_files')
        .insert({
          name: file.originalname,
          url,
          type: file.mimetype.startsWith('image/') ? 'image' : 'video',
          mime_type: file.mimetype,
          size: file.size,
          folder_id: folderId ?? null,
        })
        .returning('*');

    return mediaFile;
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.knex('media_files').where({ id }).first();
    if (!file) throw new NotFoundException('File not found');

    const filePath = join(this.UPLOADS_PATH, basename(file.url));
    if (existsSync(filePath)) unlinkSync(filePath);

    await this.knex('media_files').where({ id }).delete();
  }
}