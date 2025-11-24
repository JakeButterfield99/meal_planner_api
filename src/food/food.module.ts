import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Food } from './food.entity';

import { FoodController } from './food.controller';
import { FoodService } from './food.service';

@Module({
    imports: [TypeOrmModule.forFeature([Food])],
    controllers: [FoodController],
    providers: [FoodService],
})
export class FoodModule { }
