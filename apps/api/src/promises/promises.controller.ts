import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PromisesService } from './promises.service';
import { CreatePromiseDto } from './dto/create-promise.dto';
import { UpdatePromiseDto } from './dto/update-promise.dto';

@Controller('promises')
export class PromisesController {
  constructor(private readonly promisesService: PromisesService) {}

  @Get()
  findAll() {
    return this.promisesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promisesService.findOne(id);
  }

  @Post()
  create(@Body() createPromiseDto: CreatePromiseDto) {
    return this.promisesService.create(createPromiseDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePromiseDto: UpdatePromiseDto) {
    return this.promisesService.update(id, updatePromiseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promisesService.remove(id);
  }
}
