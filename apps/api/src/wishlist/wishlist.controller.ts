import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('admin/all')
  getAllWishlists(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.wishlistService.getAllWishlists(Number(page), Number(limit));
  }

  @Get(':userId')
  getWishlist(@Param('userId') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Post(':userId')
  addToWishlist(@Param('userId') userId: string, @Body('productId') productId: string) {
    return this.wishlistService.addToWishlist(userId, productId);
  }

  @Delete(':userId/:productId')
  removeFromWishlist(@Param('userId') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(userId, productId);
  }
}
