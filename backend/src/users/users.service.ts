import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOneBy({ email });
  }

  async findByAccountNumber(accountNumber: string): Promise<UserEntity | null> {
    return this.userRepo.findOneBy({ accountNumber });
  }

  async isAccountNumberTaken(accountNumber: string): Promise<boolean> {
    const count = await this.userRepo.count({ where: { accountNumber } });
    return count > 0;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    accountNumber: string;
  }): Promise<UserEntity> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }
}
