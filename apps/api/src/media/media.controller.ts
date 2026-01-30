import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const UPLOADS_PATH =
    process.env.NODE_ENV === 'production'
        ? '/var/www/uploads'
        : join(process.cwd(), 'uploads');
@Controller('media')
export class MediaController {
  private readonly UPLOADS_PATH: string;

  constructor(private readonly mediaService: MediaService) {
    // ✅ Use same absolute path as service
    this.UPLOADS_PATH = this.mediaService.getUploadPath();
  }

  @Get('folders')
  getFolders(@Query('parentId') parentId?: string) {
    return this.mediaService.getFolders(parentId);
  }

  @Post('folders')
  createFolder(@Body() createFolderDto: CreateFolderDto) {
    return this.mediaService.createFolder(createFolderDto);
  }

  @Delete('folders/:id')
  deleteFolder(@Param('id') id: string) {
    return this.mediaService.deleteFolder(id);
  }

  @Get('files')
  getFiles(@Query('folderId') folderId?: string) {
    return this.mediaService.getFiles(folderId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => cb(null, UPLOADS_PATH),
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(
      @UploadedFile() file: Express.Multer.File,
      @Body('folderId') folderId?: string,
      @Body('context') context?: string,
  ) {
    return this.mediaService.saveFileRecord(file, folderId, context);
  }

  @Delete('files/:id')
  deleteFile(@Param('id') id: string) {
    return this.mediaService.deleteFile(id);
  }
}