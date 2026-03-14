import {
  Injectable, ConflictException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { WalletService } from '../wallet/wallet.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly walletService: WalletService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const accountNumber = await this.generateUniqueAccountNumber();

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      accountNumber,
    });

    await this.walletService.createForUser(user.id);

    const token = this.sign(user.id, user.email);
    return {
      token,
      user: { id: user.id, email: user.email, accountNumber: user.accountNumber },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.sign(user.id, user.email);
    return {
      token,
      user: { id: user.id, email: user.email, accountNumber: user.accountNumber },
    };
  }

  private sign(userId: number, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }

  private async generateUniqueAccountNumber(): Promise<string> {
    while (true) {
      const num = String(Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000);
      const taken = await this.usersService.isAccountNumberTaken(num);
      if (!taken) return num;
    }
  }
}
