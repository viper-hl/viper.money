import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Transaction timestamp' })
  timestamp: Date;

  @ApiProperty({ description: 'From address' })
  from: string;

  @ApiProperty({ description: 'To address' })
  to: string;

  @ApiProperty({ description: 'Amount in USDC received' })
  usdcAmount: number;

  @ApiProperty({ description: 'Amount of HYPE bought' })
  hypeAmount: string;

  @ApiProperty({ description: 'Transaction hash' })
  hash: string;

  @ApiProperty({ description: 'Transaction status' })
  status: 'pending' | 'completed' | 'failed';

  @ApiProperty({ description: 'Error message if failed', required: false })
  error?: string;
}

export class SystemStatusDto {
  @ApiProperty({ description: 'System status' })
  status: 'running' | 'stopped' | 'error';

  @ApiProperty({ description: 'WebSocket connection state' })
  wsConnected: boolean;

  @ApiProperty({ description: 'User address being monitored' })
  userAddress: string;

  @ApiProperty({ description: 'Network being used' })
  network: 'mainnet' | 'testnet';

  @ApiProperty({ description: 'Target coin for purchases' })
  targetCoin: string;

  @ApiProperty({ description: 'Minimum order amount' })
  minOrderAmount: number;

  @ApiProperty({ description: 'System uptime in seconds' })
  uptime: number;

  @ApiProperty({ description: 'Number of transactions processed' })
  transactionsProcessed: number;

  @ApiProperty({ description: 'System start time' })
  startTime: Date;
}