import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron, CronExpression } from '@nestjs/schedule';

import { NotificationService } from "src/notifications/notification.service";

import { MealPlan } from "./entities/meal_plan.entity";
import { PlanItem } from "./entities/plan_item.entity";
import { PlanItemDto } from "./dto/plan_item.dto";
import { Food } from "src/food/food.entity";
import { AlertIngredient } from "./entities/alert_ingredient.entity";
import { AlertIngredientDto } from "./dto/alert_ingredient.dto";
import { GetDateKey, ParseIngredientName } from "src/utils";
import { RecipeService } from "src/recipes/recipe.service";

@Injectable()
export class MealPlanService {
    private readonly logger = new Logger(MealPlanService.name);

    constructor(
        @InjectRepository(MealPlan)
        private readonly mealPlanRepo: Repository<MealPlan>,

        @InjectRepository(PlanItem)
        private readonly planItemRepo: Repository<PlanItem>,

        @InjectRepository(Food)
        private readonly foodRepo: Repository<Food>,

        @InjectRepository(AlertIngredient)
        private readonly alertIngredientRepo: Repository<AlertIngredient>,

        private notificationService: NotificationService,
        private recipeService: RecipeService,
    ) { }

    async GetPlanById(id: number): Promise<MealPlan> {
        const plan = await this.mealPlanRepo.findOneBy({ id });
        if (!plan) throw new NotFoundException('Meal plan not found');
        return plan;
    }

    async GetMealPlan(monday: string): Promise<MealPlan> {
        const plan = await this.mealPlanRepo.findOneBy({ monday });

        if (!plan) {
            const new_plan = this.mealPlanRepo.create({
                monday: monday,
            })
            return this.mealPlanRepo.save(new_plan);
        }

        return plan;
    }

    async SavePlanItem(dto: PlanItemDto): Promise<PlanItem> {
        const food = await this.foodRepo.findOneBy({ id: dto.foodId });
        if (!food) throw new NotFoundException('Food not found');

        const mealPlan = await this.mealPlanRepo.findOneBy({ id: dto.planId });
        if (!mealPlan) throw new NotFoundException('Meal plan not found');

        const planItem = this.planItemRepo.create({
            date: dto.date,
            assigned: dto.assigned,
            type: dto.type,
            food,
            mealPlan,
        });

        return await this.planItemRepo.save(planItem);
    }

    async DeletePlanItem(id: number): Promise<void> {
        const planItem = this.planItemRepo.findOneBy({ id });
        if (!planItem) throw new NotFoundException('Plan item not found');

        // Delete the plan item
        const result = await this.planItemRepo.delete(id);
        if (result.affected === 0)
            throw new NotFoundException(`Plan Item with ID ${id} not found`);
    }

    async GetAlertIngredients(): Promise<AlertIngredient[]> {
        return this.alertIngredientRepo.find();
    }

    async AddAlertIngredient(dto: AlertIngredientDto): Promise<AlertIngredient[]> {
        const alert_ing = this.alertIngredientRepo.create({
            item: dto.item
        });
        await this.alertIngredientRepo.save(alert_ing);
        return this.GetAlertIngredients();
    }

    async RemoveAlertIngredient(id: number): Promise<AlertIngredient[]> {
        const alertIng = this.alertIngredientRepo.findOneBy({ id });
        if (!alertIng) throw new NotFoundException('Plan item not found');

        // Delete the plan item
        const result = await this.alertIngredientRepo.delete(id);
        if (result.affected === 0)
            throw new NotFoundException(`Plan Item with ID ${id} not found`);

        return this.GetAlertIngredients();
    }

    async NotifyMealPlan() {
        this.logger.debug('Running scheduled task at 8PM');

        // Get tomorrows date key
        const date = new Date();
        date.setDate(date.getDate() + 1);
        const date_str = GetDateKey(date);

        // Check if there is a plan entry for tomorrow
        const planItems = await this.planItemRepo.findBy({ date: date_str });
        if (!planItems || planItems.length === 0)
            return;

        // Find any alert ingredients in the plan items
        const alertIngredients = await this.GetAlertIngredients();
        const ingredients: string[] = [];

        for (const item of planItems) {
            if (!item.food.recipes) continue;
            for (const recipe of item.food.recipes) {
                const recipeContents = await this.recipeService.getRecipe(recipe.id);
                if (!recipeContents || !recipeContents.ingredients)
                    continue;

                for (const ingredient of recipeContents.ingredients) {
                    const should_alert = alertIngredients.find(val => val.item === ingredient.text);
                    if (should_alert) {
                        ingredients.push(ingredient.text);
                    }
                }
            }
        }

        this.notificationService.NotifyMealPlan(date, planItems, ingredients);
    }
}