import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Location } from './location.entity';
import { InventoryItem } from './inventory-item.entity';
import { InventoryService } from './inventory.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
  imports: [MikroOrmModule.forFeature([Location, InventoryItem])],
})
export class InventoryModule {}
