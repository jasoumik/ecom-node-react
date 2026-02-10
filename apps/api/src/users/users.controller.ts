import { Controller, Get, Delete, Param, UseGuards, Put, Body, Post, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('profile/:id')
  getProfile(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  updateProfile(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.update(id, updateProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get(':id/addresses')
  getAddresses(@Param('id') id: string) {
    return this.usersService.getAddresses(id);
  }

  @Post(':id/addresses')
  addAddress(@Param('id') id: string, @Body() addressData: any) {
    return this.usersService.addAddress(id, addressData);
  }

  @Delete(':id/addresses/:addressId')
  deleteAddress(@Param('id') id: string, @Param('addressId') addressId: string) {
    return this.usersService.deleteAddress(addressId, id);
  }
}
