import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(): Promise<any[]> {
    return this.knex('users').select('id', 'name', 'email', 'phone', 'role', 'created_at', 'avatar');
  }

  async findOne(id: string): Promise<any> {
    const user = await this.knex('users').where({ id }).first();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { passwordHash, ...result } = user;
    return result;
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

  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<any> {
    const [user] = await this.knex('users')
      .where({ id })
      .update(updateProfileDto)
      .returning('*');
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.knex('users').where({ id }).delete();
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // Address Management
  async getAddresses(userId: string): Promise<any[]> {
    return this.knex('addresses').where({ user_id: userId });
  }

  async addAddress(userId: string, addressData: any): Promise<any> {
    // If default, unset other defaults
    if (addressData.is_default) {
      await this.knex('addresses').where({ user_id: userId }).update({ is_default: false });
    }
    
    const [address] = await this.knex('addresses').insert({
      user_id: userId,
      ...addressData
    }).returning('*');
    return address;
  }

  async deleteAddress(id: string, userId: string): Promise<void> {
    await this.knex('addresses').where({ id, user_id: userId }).delete();
  }
}
