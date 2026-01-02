import { MealType } from "src/meal_plan/entities/plan_item.entity"
import { Recipe } from "src/recipes/recipe.type"

export class FoodDto {
    name?: string
    image?: string
    tags?: MealType[]
    recipes?: Recipe[]
}