import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MealPlanService } from "src/meal_plan/meal_plan.service";

@Injectable()
export class SchedulerService {
    constructor(
        private mealPlanService: MealPlanService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_8PM, { timeZone: 'America/Toronto' })
    ScheduleMealPlanNotify() {
        return this.mealPlanService.NotifyMealPlan();
    }
};