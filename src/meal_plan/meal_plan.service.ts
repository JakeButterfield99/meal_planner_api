import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { NotificationService } from "src/notifications/notification.service";

import { MealPlan } from "./entities/meal_plan.entity";
import { PlanItem } from "./entities/plan_item.entity";
import { PlanItemDto } from "./dto/plan_item.dto";
import { Food } from "src/food/food.entity";

@Injectable()
export class MealPlanService {
    constructor(
        @InjectRepository(MealPlan)
        private readonly mealPlanRepo: Repository<MealPlan>,

        @InjectRepository(PlanItem)
        private readonly planItemRepo: Repository<PlanItem>,

        @InjectRepository(Food)
        private readonly foodRepo: Repository<Food>,

        private notificationService: NotificationService,
    ) { }

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
        })

        //this.notificationService.SendNotification(`Added item ${food.name} to plan on date: ${mealPlan.monday}`);

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
}