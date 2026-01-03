import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShoppingList } from './shopping_list.entity';
import { ShoppingListController } from './shopping_list.controller';
import { ShoppingListService } from './shopping_list.service';
import { MealPlanService } from 'src/meal_plan/meal_plan.service';
import { MealPlan } from 'src/meal_plan/entities/meal_plan.entity';
import { PlanItem } from 'src/meal_plan/entities/plan_item.entity';
import { Food } from 'src/food/food.entity';
import { NotificationService } from 'src/notifications/notification.service';
import { ConfigService } from '@nestjs/config';
import { RecipeService } from 'src/recipes/recipe.service';

@Module({
    imports: [TypeOrmModule.forFeature([ShoppingList, MealPlan, PlanItem, Food])],
    controllers: [ShoppingListController],
    providers: [ShoppingListService, MealPlanService, NotificationService, ConfigService, RecipeService]
})
export class ShoppingListModule { }