import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SchedulerService } from './scheduler.service';
import { MealPlanService } from 'src/meal_plan/meal_plan.service';
import { RecipeService } from 'src/recipes/recipe.service';
import { NotificationService } from 'src/notifications/notification.service';
import { ConfigService } from '@nestjs/config';

import { MealPlan } from 'src/meal_plan/entities/meal_plan.entity';
import { PlanItem } from 'src/meal_plan/entities/plan_item.entity';
import { Food } from 'src/food/food.entity';
import { AlertIngredient } from 'src/meal_plan/entities/alert_ingredient.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MealPlan, PlanItem, Food, AlertIngredient])],
    providers: [SchedulerService, MealPlanService, RecipeService, NotificationService, ConfigService],
})
export class SchedulerModule { }
