import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class UsersService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(): Promise<any[]> {
    return this.knex('users').select('id', 'name', 'email', 'phone', 'role', 'created_at');
  }

  async findOneByEmail(email: string): Promise<any> {
    return this.knex('users').where({ email }).first();
  }

  async findOneByPhone(phone: string): Promise<any> {
    return this.knex('users').where({ phone }).first();
  }

  async create(userData: any): Promise<any> {
    const [user] = await this.knex('users').insert(userData).returning('*');
    return user;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.knex('users').where({ id }).delete();
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
