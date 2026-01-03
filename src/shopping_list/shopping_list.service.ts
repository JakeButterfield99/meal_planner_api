import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ShoppingList } from "./shopping_list.entity";
import { Repository } from "typeorm";
import { GenerateListDto } from "./shopping_list.dto";
import { MealPlanService } from "src/meal_plan/meal_plan.service";
import { RecipeService } from "src/recipes/recipe.service";
import { Recipe, RecipeContents } from "src/recipes/recipe.type";

function ParseIngredientName(input: string): string {
	let text = input.toLowerCase().trim();

	// Remove parenthetical notes
	text = text.replace(/\([^)]*\)/g, "");

	// Unicode fraction characters
	const fractions = "½⅓⅔¼¾⅛⅜⅝⅞";

	// Remove leading quantities (numbers, unicode fractions, mixed, ranges)
	const quantityRegex = new RegExp(
		`^(\\d+\\s*[${fractions}]|\\d+[${fractions}]|[${fractions}]|` +
		`\\d+(?:[\\/\\.]\d+)?|` +
		`\\d+\\s*(?:-|–|to)\\s*\\d+\\s*)\\s*`,
		"i"
	);

	text = text.replace(quantityRegex, "");

	// Remove common units
	text = text.replace(
		/^(cups?|cup|tablespoons?|tbsp|teaspoons?|tsp|pounds?|lbs?|ounces?|oz|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|pinch|dash)\s+/i,
		""
	);

	// Remove "of" if it follows a unit
	text = text.replace(/^of\s+/i, "");

	// Remove preparation notes after commas
	text = text.split(",")[0];

	// Remove trailing preparation phrases
	text = text.replace(
		/\b(chopped|diced|minced|sliced|cut|cubed|crushed|grated|ground|to taste)\b.*$/i,
		""
	);

	return text.trim();
}

@Injectable()
export class ShoppingListService {
	constructor(
		@InjectRepository(ShoppingList)
		private readonly shoppingListRepo: Repository<ShoppingList>,

		private mealPlanService: MealPlanService,
		private recipeService: RecipeService,
	) { }

	async GetShoppingList() {
		return this.shoppingListRepo.find();
	}

	async GenerateList(dto: GenerateListDto): Promise<ShoppingList[]> {
		if (!dto.planId) return [];

		this.shoppingListRepo.clear();

		let shopping_list: ShoppingList[] = [];
		let recipes: RecipeContents[] = [];

		const plan = await this.mealPlanService.GetPlanById(dto.planId);
		for (const item of plan.items) {
			if (!item.food) continue;
			if (!item.food.recipes) continue;

			for (const recipe of item.food.recipes) {
				const recipe_data = await this.recipeService.getRecipe(recipe.id);
				recipes.push(recipe_data);
			}
		}

		for (const recipe of recipes) {
			for (const ingredient of recipe.ingredients) {
				if (ingredient.type !== 'to_do') continue;

				const name = ParseIngredientName(ingredient.text);
				if (name === "") continue;

				const existing = shopping_list.find(i => i.item.toLowerCase() === name.toLowerCase());
				if (existing) continue;

				let shoppingListItem = this.shoppingListRepo.create({
					item: name,
					checked: false,
				});
				shoppingListItem = await this.shoppingListRepo.save(shoppingListItem);
				shopping_list.push(shoppingListItem);
			}
		}

		return shopping_list;
	}
}