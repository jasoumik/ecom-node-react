import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { memoryStorage } from 'multer';
import { ImageProcessingService } from '../image-processing/image-processing.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

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
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId?: string,
    @Body('context') context?: string,
  ) {
    const processed = await this.imageProcessingService.processAndSaveImage(file);
    return this.mediaService.saveFileRecord(
      { ...file, filename: processed.filename, mimetype: processed.mimetype, size: processed.size },
      folderId,
      context,
    );
  }

  @Delete('files/:id')
  deleteFile(@Param('id') id: string) {
    return this.mediaService.deleteFile(id);
  }

  @Post('files/:id/move')
  moveFile(@Param('id') id: string, @Body('folderId') folderId: string) {
    return this.mediaService.moveFile(id, folderId);
  }
}
