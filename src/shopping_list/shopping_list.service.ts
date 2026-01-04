import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { IgnoredItems, ShoppingList } from "./shopping_list.entity";
import { GenerateListDto, UpdateListDto } from "./shopping_list.dto";
import { MealPlanService } from "src/meal_plan/meal_plan.service";
import { RecipeService } from "src/recipes/recipe.service";
import { Recipe, RecipeContents } from "src/recipes/recipe.type";
import { ConfigService } from "@nestjs/config";

const AnyList = require('anylist');

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
		/^(cups?|cup|tablespoons?|tbsp|teaspoons?|tsp|pounds?|lbs?|ounces?|oz|grams?|g|kilograms?|kg|cloves?|milliliters?|ml|liters?|l|pinch|dash)\s+/i,
		""
	);

	// Remove "of" if it follows a unit
	text = text.replace(/^of\s+/i, "");

	// Remove preparation notes after commas
	text = text.split(",")[0];

	// Remove trailing preparation phrases
	text = text.replace(
		/\b(diced|minced|sliced|cut|cubed|grated|to taste)\b.*$/i,
		""
	);

	return text.trim();
}

@Injectable()
export class ShoppingListService {
	anylist: any;

	constructor(
		@InjectRepository(ShoppingList)
		private readonly shoppingListRepo: Repository<ShoppingList>,

		@InjectRepository(IgnoredItems)
		private readonly ignoredItemsRepo: Repository<IgnoredItems>,

		private mealPlanService: MealPlanService,
		private recipeService: RecipeService,
		private configService: ConfigService
	) {
		this.anylist = new AnyList({
			email: this.configService.get<string>('ANYLIST_EMAIL'),
			password: this.configService.get<string>('ANYLIST_PWD')
		});
	}

	async GetShoppingList() {
		return this.shoppingListRepo.find({
			order: { id: "ASC" }
		});
	}

	async GetIgnoredItems() {
		return this.ignoredItemsRepo.find();
	}

	async UpdateShoppingList(dto: UpdateListDto): Promise<ShoppingList[]> {
		const item = await this.shoppingListRepo.findOneBy({ id: dto.id });
		if (!item) throw new NotFoundException(`Shopping list item with ID ${dto.id} not found`);

		if (dto.remove) {
			await this.shoppingListRepo.remove(item);
		}
		else if (dto.checked !== undefined && item.checked !== dto.checked) {
			item.checked = dto.checked;
			await this.shoppingListRepo.save(item);
		}
		else if (dto.ignore) {
			const ignoredItem = this.ignoredItemsRepo.create({ item: item.item })
			await this.ignoredItemsRepo.save(ignoredItem);
			await this.shoppingListRepo.remove(item);
		}

		return this.GetShoppingList();
	}

	async GenerateList(dto: GenerateListDto): Promise<ShoppingList[]> {
		if (!dto.planId) return [];

		this.shoppingListRepo.clear();

		const ignoredItems = await this.GetIgnoredItems();
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

				const ignore = ignoredItems.find(i => i.item.toLowerCase() === name.toLowerCase());
				if (ignore) {
					console.log("FOUND IGNORED INGREDIENT", name.toLowerCase());
					continue;
				};

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

	async AddToAnyList(): Promise<void> {
		const list = await this.GetShoppingList();

		this.anylist.login().then(async () => {
			await this.anylist.getLists();
			const shared_list = await this.anylist.getListByName("Shared Grocery List");

			list.map((async val => {
				if (val.checked) return;
				let anylist_item = this.anylist.createItem({ name: val.item });
				await shared_list.addItem(anylist_item);
			}));

			this.anylist.teardown();
		});
	}

	async ClearList(): Promise<ShoppingList[]> {
		this.shoppingListRepo.clear();
		return [];
	}
}