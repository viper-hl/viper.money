import { IsString, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ManualProcessDto {
  @ApiProperty({ description: 'Amount in USDC to process', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Sender address to return HYPE to', example: '0x...' })
  @IsString()
  senderAddress: string;

  @ApiPropertyOptional({ description: 'Token to buy (default: HYPE)', example: 'HYPE' })
  @IsOptional()
  @IsString()
  targetCoin?: string;

  @ApiPropertyOptional({ description: 'Slippage percentage', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  slippagePercent?: number;
}

export class StartMonitoringDto {
  @ApiPropertyOptional({ description: 'Minimum order amount in USDC', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Target coin to buy', example: 'HYPE' })
  @IsOptional()
  @IsString()
  targetCoin?: string;

  @ApiPropertyOptional({ description: 'Use testnet', example: false })
  @IsOptional()
  @IsBoolean()
  testnet?: boolean;
}