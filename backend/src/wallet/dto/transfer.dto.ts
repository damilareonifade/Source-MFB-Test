import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsInt()
  @Min(1)
  amount: number;
}
