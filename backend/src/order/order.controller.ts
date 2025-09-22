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
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/users.entity';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  static BASE_DIRECTORY = join(process.env.HOME || process.env.USERPROFILE || '', 'Downloads', 'uploads');

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        /* 1) on met d’abord le fichier dans un dossier temporaire */
        destination: (req, file, cb) => {
          const tempDir = join(OrderController.BASE_DIRECTORY, 'temp');
          if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
          cb(null, tempDir);
        },
        /* 2) on conserve le nom d’origine (ou tu peux ajouter un suffixe) */
        filename: (req, file, cb) => cb(null, file.originalname),
      }),
    }),
  )


  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('username') username: string, // le frontend passera ?username=alice
  ) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    if (!username) throw new BadRequestException('Paramètre username manquant');

    /* -- déplacement du fichier depuis temp/ vers le dossier définitif -- */
    const fs = await import('fs'); // import dynamique pour ESM/CJS
    const path = await import('path');

    const userDir = join(
      OrderController.BASE_DIRECTORY,
      username,
      'Commandes',
    );
    if (!existsSync(userDir)) mkdirSync(userDir, { recursive: true });

    const tempPath = file.path;
    const targetPath = path.join(userDir, file.originalname);

    fs.renameSync(tempPath, targetPath);

    return { filename: file.originalname };
  }

  @Get('download/:fileName')
  async downloadFile(
    @Param('fileName') fileName: string,
    @Query('username') username: string,
    @Res() res: Response,
  ) {
    if (!username) throw new BadRequestException('Paramètre username manquant');

    const userDir = join(
      OrderController.BASE_DIRECTORY,
      username,
      'Commandes',
    );
    const filePath = join(userDir, fileName);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Fichier introuvable');
    }

    res.set({
      'Content-Type': 'application/pdf', // adapte si tu acceptes d’autres types
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    createReadStream(filePath).pipe(res);
  }
  
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
  async archivera(@Param('id') id: number,@CurrentUser() user: User): Promise<Order> {
    if (!user || !user.role || !user.role.name) {
      throw new UnauthorizedException('User non authentifié');
    }
    const roleName = user.role.name.toUpperCase();

    if (roleName.startsWith('CLIENT')) {
      // Archivage client
      return this.orderService.archiverc(id);
    } else {
      // Archivage admin/ autre rôle
      return this.orderService.archivera(id);
    }
  }
  

  @Put('/archiverc/:id')
  async archiverc(@Param('id') id: number,@CurrentUser() user: User): Promise<Order> {
    if (!user || !user.role || !user.role.name) {
      throw new UnauthorizedException('User non authentifié');
    }
    const roleName = user.role.name.toUpperCase();

    if (roleName.startsWith('CLIENT')) {
      // Archivage client
      return this.orderService.archiverc(id);
    } else {
      // Archivage admin/ autre rôle
      return this.orderService.archivera(id);
    }
  }
  

  @Get('archive/user')
getArchiveForCurrentUser(@CurrentUser() user: User): Promise<Order[]> {
  return this.orderService.getArchiveByUserRole(user);
}
  
}
