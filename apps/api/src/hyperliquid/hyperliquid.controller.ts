import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  HttpException, 
  HttpStatus,
  Query,
  ParseIntPipe,
  Optional
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiQuery,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { HyperliquidService } from './hyperliquid.service';
import { ManualProcessDto, StartMonitoringDto } from './dto/manual-process.dto';
import { TransactionDto, SystemStatusDto } from './dto/transaction-response.dto';

@ApiTags('Hyperliquid')
@Controller('hyperliquid')
export class HyperliquidController {
  constructor(private readonly hyperliquidService: HyperliquidService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get system status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the current system status',
    type: SystemStatusDto 
  })
  getStatus() {
    return this.hyperliquidService.getStatus();
  }

  @Post('start')
  @ApiOperation({ summary: 'Start monitoring USDC deposits' })
  @ApiResponse({ 
    status: 200, 
    description: 'Monitoring started successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        config: {
          type: 'object',
          properties: {
            userAddress: { type: 'string' },
            network: { type: 'string' },
            targetCoin: { type: 'string' },
            minOrderAmount: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid configuration' })
  startMonitoring(@Body() dto: StartMonitoringDto) {
    try {
      return this.hyperliquidService.startMonitoring(dto);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to start monitoring',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop monitoring USDC deposits' })
  @ApiResponse({ 
    status: 200, 
    description: 'Monitoring stopped successfully',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  stopMonitoring() {
    return this.hyperliquidService.stopMonitoring();
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get processed transactions' })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of transactions to return' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns list of processed transactions',
    type: [TransactionDto]
  })
  getTransactions(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.hyperliquidService.getTransactions(limit);
  }

  @Post('manual-process')
  @ApiOperation({ 
    summary: 'Manually process USDC to HYPE conversion',
    description: 'Manually trigger the process to buy HYPE with USDC and send it to a specific address'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Process completed successfully',
    type: TransactionDto
  })
  @ApiBadRequestResponse({ description: 'Invalid parameters or insufficient balance' })
  @ApiInternalServerErrorResponse({ description: 'Processing failed' })
  async manualProcess(@Body() dto: ManualProcessDto) {
    try {
      const result = await this.hyperliquidService.processManual(
        dto.amount,
        dto.senderAddress,
        dto.targetCoin,
        dto.slippagePercent
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Processing failed';
      
      if (message.includes('balance') || message.includes('minimum')) {
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
      
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}