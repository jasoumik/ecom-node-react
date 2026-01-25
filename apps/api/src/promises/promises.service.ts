import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreatePromiseDto } from './dto/create-promise.dto';
import { UpdatePromiseDto } from './dto/update-promise.dto';

@Injectable()
export class PromisesService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll() {
    return this.knex('promises').orderBy('order', 'asc');
  }

  async findOne(id: string) {
    const promise = await this.knex('promises').where({ id }).first();
    if (!promise) throw new NotFoundException(`Promise with ID ${id} not found`);
    return promise;
  }

  async create(createPromiseDto: CreatePromiseDto) {
    const [promise] = await this.knex('promises').insert(createPromiseDto).returning('*');
    return promise;
  }

  async update(id: string, updatePromiseDto: UpdatePromiseDto) {
    const [promise] = await this.knex('promises')
      .where({ id })
      .update(updatePromiseDto)
      .returning('*');
    if (!promise) throw new NotFoundException(`Promise with ID ${id} not found`);
    return promise;
  }

  async remove(id: string) {
    const deleted = await this.knex('promises').where({ id }).delete();
    if (!deleted) throw new NotFoundException(`Promise with ID ${id} not found`);
  }
}
