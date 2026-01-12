import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MealPlan } from './entities/meal_plan.entity';
import { PlanItem } from './entities/plan_item.entity';
import { Food } from 'src/food/food.entity';

import { MealPlanController } from './meal_plan.controller';
import { MealPlanService } from './meal_plan.service';
import { FoodService } from 'src/food/food.service';
import { NotificationService } from 'src/notifications/notification.service';
import { ConfigService } from '@nestjs/config';
import { AlertIngredient } from './entities/alert_ingredient.entity';
import { RecipeService } from 'src/recipes/recipe.service';

@Module({
    imports: [TypeOrmModule.forFeature([MealPlan, PlanItem, Food, AlertIngredient])],
    controllers: [MealPlanController],
    providers: [MealPlanService, FoodService, NotificationService, ConfigService, RecipeService],
})
export class MealPlanModule { }
