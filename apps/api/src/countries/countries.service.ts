import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(): Promise<any[]> {
    return this.knex('countries').select('*');
  }

  async findOne(id: string): Promise<any> {
    const country = await this.knex('countries').where({ id }).first();
    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }
    return country;
  }

  async create(createCountryDto: CreateCountryDto): Promise<any> {
    const [country] = await this.knex('countries').insert(createCountryDto).returning('*');
    return country;
  }

  async update(id: string, updateCountryDto: UpdateCountryDto): Promise<any> {
    const [country] = await this.knex('countries')
      .where({ id })
      .update(updateCountryDto)
      .returning('*');
    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }
    return country;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.knex('countries').where({ id }).delete();
    if (!deleted) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }
  }
}
