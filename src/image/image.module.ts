import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImageController } from './image.controller';
import { ImageService } from './image.service';

import { FoodService } from 'src/food/food.service';
import { Food } from 'src/food/food.entity';
import { PlanItem } from 'src/meal_plan/entities/plan_item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Food, PlanItem])],
    controllers: [ImageController],
    providers: [ImageService, ConfigService, FoodService],
})
export class ImageModule { }
