import { MealType } from "src/meal_plan/entities/plan_item.entity"

export class FoodDto {
    name?: string
    image?: string
    recipeId?: number
    tags?: MealType[]
}