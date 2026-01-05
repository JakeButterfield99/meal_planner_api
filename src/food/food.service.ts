import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Food } from "../food/food.entity";
import { FoodDto } from "./food.dto";
import { PlanItem } from '../meal_plan/entities/plan_item.entity';

@Injectable()
export class FoodService {
    constructor(
        @InjectRepository(Food)
        private readonly foodRepo: Repository<Food>,

        @InjectRepository(PlanItem)
        private readonly planItemRepo: Repository<PlanItem>,
    ) { }

    async create(dto: FoodDto): Promise<Food> {
        const food = this.foodRepo.create(dto);
        return this.foodRepo.save(food);
    }

    async findAll(): Promise<Food[]> {
        return this.foodRepo.find({
            order: { name: "ASC" }
        });
    }

    async findOne(id: number): Promise<Food> {
        const food = await this.foodRepo.findOneBy({ id });
        if (!food) throw new NotFoundException(`Food with ID ${id} not found`);
        return food;
    }

    async update(id: number, dto: FoodDto): Promise<Food> {
        const food = await this.findOne(id);
        Object.assign(food, dto);
        return this.foodRepo.save(food);
    }

    async delete(id: number): Promise<void> {
        const food = await this.foodRepo.findOneBy({ id });
        if (!food) throw new NotFoundException(`Food with ID ${id} not found`);

        // Delete the food
        const result = await this.foodRepo.delete(id);
        if (result.affected === 0)
            throw new NotFoundException(`Food with ID ${id} not found`);
    }
}