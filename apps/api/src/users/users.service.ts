import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Knex } from 'knex';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  private isValidBdPhone(phone: string): boolean {
    const trimmed = phone.replace(/\s+/g, '');
    return /^01[3-9]\d{8}$/.test(trimmed) || /^\+?8801[3-9]\d{8}$/.test(trimmed);
  }

  async findAll(): Promise<any[]> {
    return this.knex('users').select('id', 'name', 'email', 'phone', 'role', 'created_at', 'avatar', 'is_active');
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

  async create(createUserDto: CreateUserDto): Promise<any> {
    const existingUser = await this.knex('users')
        .where({ phone: createUserDto.phone })
        .orWhere({ email: createUserDto.email || '' })
        .first();

    if (existingUser) {
        throw new BadRequestException('User with this phone or email already exists');
    }

    const password = createUserDto.password || '123456'; // Default password if not provided
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const [user] = await this.knex('users').insert({
        name: createUserDto.name,
        phone: createUserDto.phone,
        email: createUserDto.email,
        passwordHash,
        role: createUserDto.role || 'customer',
        is_active: true
    }).returning('*');

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<any> {
    if (updateProfileDto.phone) {
      if (!this.isValidBdPhone(updateProfileDto.phone)) {
        throw new BadRequestException('Invalid Bangladeshi phone number');
      }

      const existing = await this.knex('users')
        .where({ phone: updateProfileDto.phone })
        .andWhereNot({ id })
        .first();

      if (existing) {
        throw new BadRequestException('Phone number already in use');
      }
    }

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

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.knex('users').where({ id }).first();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isMatch = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(changePasswordDto.newPassword, salt);

    await this.knex('users').where({ id }).update({ passwordHash });
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
    // Check if user exists
    const user = await this.knex('users').where({ id: userId }).first();
    if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
    }

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
