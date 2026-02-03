import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AgeGroupsService } from './age-groups.service';
import { CreateAgeGroupDto } from './dto/create-age-group.dto';
import { UpdateAgeGroupDto } from './dto/update-age-group.dto';

@Controller('age-groups')
export class AgeGroupsController {
  constructor(private readonly ageGroupsService: AgeGroupsService) {}

  @Get()
  async findAll(
    @Query('tenant') tenantId: string = 'default',
    @Query('includeInactive') includeInactive: string,
  ) {
    return this.ageGroupsService.findAll(tenantId, includeInactive === 'true');
  }

  @Get('with-categories')
  async findWithCategories(@Query('tenant') tenantId: string = 'default') {
    return this.ageGroupsService.findWithCategories(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ageGroupsService.findOne(id);
  }

  @Post()
  async create(
    @Body() dto: CreateAgeGroupDto,
    @Query('tenant') tenantId: string = 'default',
  ) {
    return this.ageGroupsService.create(dto, tenantId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAgeGroupDto) {
    return this.ageGroupsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.ageGroupsService.remove(id);
  }
}

