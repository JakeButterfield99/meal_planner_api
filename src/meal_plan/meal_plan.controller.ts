import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { MealPlanService } from "./meal_plan.service";

import { PlanItemDto } from "./dto/plan_item.dto";
import { AlertIngredientDto } from "./dto/alert_ingredient.dto";

@Controller("meal_plan")
export class MealPlanController {
    constructor(
        private readonly mealPlanService: MealPlanService
    ) { }

    @Get()
    GetMealPlan(@Query('monday') monday: string) {
        return this.mealPlanService.GetMealPlan(monday);
    }

    @Post()
    AddPlanItem(@Body() dto: PlanItemDto) {
        return this.mealPlanService.SavePlanItem(dto);
    }

    @Delete(':id')
    DeleteFood(@Param('id') id: string) {
        return this.mealPlanService.DeletePlanItem(Number(id));
    }

    @Get("/alert_ingredients")
    GetAlertIngredients() {
        return this.mealPlanService.GetAlertIngredients();
    }

    @Post("/alert_ingredients")
    AddAlertIngredient(@Body() dto: AlertIngredientDto) {
        return this.mealPlanService.AddAlertIngredient(dto);
    }

    @Delete("/alert_ingredients/:id")
    RemoveAlertIngredient(@Param('id') id: string) {
        return this.mealPlanService.RemoveAlertIngredient(Number(id));
    }
}