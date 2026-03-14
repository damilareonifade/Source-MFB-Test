import {
  Controller, Get, Post, Body, UseGuards, Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@Request() req: any) {
    return this.walletService.getForUser(req.user.userId);
  }

  @Post('deposit')
  deposit(@Request() req: any, @Body() dto: DepositDto) {
    return this.walletService.deposit(req.user.userId, dto);
  }

  @Post('transfer')
  transfer(@Request() req: any, @Body() dto: TransferDto) {
    return this.walletService.transfer(req.user.userId, dto);
  }
}
