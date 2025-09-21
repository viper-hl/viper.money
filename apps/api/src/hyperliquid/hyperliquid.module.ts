import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HyperliquidService } from './hyperliquid.service';
import { HyperliquidController } from './hyperliquid.controller';

@Module({
  imports: [ConfigModule],
  controllers: [HyperliquidController],
  providers: [HyperliquidService],
  exports: [HyperliquidService],
})
export class HyperliquidModule {}