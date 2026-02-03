import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateAgeGroupDto } from './dto/create-age-group.dto';
import { UpdateAgeGroupDto } from './dto/update-age-group.dto';
import { AgeGroup } from './age-group.entity';

@Injectable()
export class AgeGroupsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(tenantId: string = 'default', includeInactive: boolean = false): Promise<AgeGroup[]> {
    const query = this.knex('age_groups')
      .where('tenant_id', tenantId)
      .orderBy('sort_order', 'asc');

    if (!includeInactive) {
      query.where('is_active', true);
    }

    return query;
  }

  async findOne(id: string): Promise<AgeGroup> {
    const ageGroup = await this.knex('age_groups').where('id', id).first();
    if (!ageGroup) {
      throw new NotFoundException(`Age group with ID ${id} not found`);
    }
    return ageGroup;
  }

  async create(dto: CreateAgeGroupDto, tenantId: string = 'default'): Promise<AgeGroup> {
    const [ageGroup] = await this.knex('age_groups')
      .insert({
        ...dto,
        tenant_id: tenantId,
        sort_order: dto.sort_order ?? 0,
        is_active: dto.is_active ?? true,
      })
      .returning('*');
    return ageGroup;
  }

  async update(id: string, dto: UpdateAgeGroupDto): Promise<AgeGroup> {
    const [updated] = await this.knex('age_groups')
      .where('id', id)
      .update({
        ...dto,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    if (!updated) {
      throw new NotFoundException(`Age group with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.knex('age_groups').where('id', id).delete();
    if (!deleted) {
      throw new NotFoundException(`Age group with ID ${id} not found`);
    }
  }

  async findWithCategories(tenantId: string = 'default'): Promise<any[]> {
    const ageGroups = await this.findAll(tenantId);

    const ageGroupsWithCategories = await Promise.all(
      ageGroups.map(async (ageGroup) => {
        const categories = await this.knex('categories')
          .where('age_group_id', ageGroup.id)
          .orderBy('name', 'asc');
        return {
          ...ageGroup,
          categories,
        };
      })
    );

    return ageGroupsWithCategories;
  }
}

