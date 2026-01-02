import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Food } from './food.entity';
import { PlanItem } from '../meal_plan/entities/plan_item.entity';

import { FoodController } from './food.controller';
import { FoodService } from './food.service';

@Module({
    imports: [TypeOrmModule.forFeature([Food, PlanItem])],
    controllers: [FoodController],
    providers: [FoodService],
})
export class FoodModule { }
