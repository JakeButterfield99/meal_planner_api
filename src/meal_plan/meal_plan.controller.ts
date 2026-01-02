import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { MealPlanService } from "./meal_plan.service";
import { FoodService } from "src/food/food.service";
import { PlanItemDto } from "./dto/plan_item.dto";

@Controller("meal_plan")
export class MealPlanController {
    constructor(
        private readonly mealPlanService: MealPlanService,
        private readonly foodService: FoodService,
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
}