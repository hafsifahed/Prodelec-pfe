import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  static BASE_DIRECTORY = join(process.env.HOME || process.env.USERPROFILE || '', 'Downloads', 'uploads');

  @Post('/:idUser')
  async addOrder(@Body() orderData: Partial<Order>, @Param('idUser') idUser: number): Promise<Order> {
    return this.orderService.addOrder(orderData, idUser);
  }

  @Put('/:id')
  async updateOrder(@Param('id') id: number, @Body() orderData: Partial<Order>): Promise<Order> {
    return this.orderService.updateOrder(id, orderData);
  }

  @Get()
  async getAllOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  @Get('/:id')
  async getOrderById(@Param('id') id: number): Promise<Order> {
    return this.orderService.getOrderById(id);
  }

  @Delete('/:id')
  async deleteOrder(@Param('id') id: number): Promise<void> {
    await this.orderService.deleteOrder(id);
  }

  @Get('/user/:userId')
  async getOrdersByUser(@Param('userId') userId: number): Promise<Order[]> {
    return this.orderService.getOrdersByUser(userId);
  }

  @Put('/status/:id')
  async changeStatus(@Param('id') id: number): Promise<Order> {
    return this.orderService.changeStatus(id);
  }

  @Put('/archivera/:id')
  async archivera(@Param('id') id: number): Promise<Order> {
    return this.orderService.archivera(id);
  }

  @Put('/archiverc/:id')
  async archiverc(@Param('id') id: number): Promise<Order> {
    return this.orderService.archiverc(id);
  }

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const username = req.body.username || 'anonymous';
          const userDir = join(OrderController.BASE_DIRECTORY, username, 'Commandes');
          if (!existsSync(userDir)) mkdirSync(userDir, { recursive: true });
          cb(null, userDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.originalname.replace(ext, '')}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{ filename: string }> {
    if (!file) throw new BadRequestException('No file uploaded');
    return { filename: file.filename };
  }

  @Get('/download/:fileName')
  async downloadFile(@Param('fileName') fileName: string, @Query('username') username: string, @Res() res: Response) {
    const userDir = join(OrderController.BASE_DIRECTORY, username, 'Commandes');
    const filePath = join(userDir, fileName);

    if (!existsSync(filePath)) throw new NotFoundException('File not found');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    createReadStream(filePath).pipe(res);
  }
}
