import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class UsersService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

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
}
