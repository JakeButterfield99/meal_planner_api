import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";

import { IgnoredItems, ShoppingList } from "./shopping_list.entity";

import { AddIngredientToListDto, UpdateListDto } from "./shopping_list.dto";
import { MealPlanService } from "src/meal_plan/meal_plan.service";
import { RecipeService } from "src/recipes/recipe.service";

import { GetNextDateKeys, ParseIngredientName } from "src/utils";

const AnyList = require('anylist');

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

	async RemoveIgnoredItem(id: number) {
		const result = await this.ignoredItemsRepo.delete(id);
		if (result.affected === 0)
			throw new NotFoundException(`Plan Item with ID ${id} not found`);
	}

	async AddIngredientToList(dto: AddIngredientToListDto): Promise<ShoppingList[]> {
		let shopping_list: ShoppingList[] = await this.GetShoppingList();

		const name = ParseIngredientName(dto.item);
		if (name === "") throw new NotFoundException("Ingredient name not found");

		const existing = shopping_list.find(i => i.item.toLowerCase() === name.toLowerCase());
		if (existing) return shopping_list;

		let shoppingListItem = this.shoppingListRepo.create({
			item: name,
			checked: false,
		});
		shoppingListItem = await this.shoppingListRepo.save(shoppingListItem);
		shopping_list.push(shoppingListItem);

		return shopping_list;
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

	async GenerateList(): Promise<ShoppingList[]> {
		const ignoredItems = await this.GetIgnoredItems();
		let shopping_list: ShoppingList[] = [];

		// Clear the repo
		this.shoppingListRepo.clear();

		// Get the next 4 mondays to pull from
		const dateKeys = GetNextDateKeys(4);

		// Loop through the plans
		for (const key of dateKeys) {
			const meal_plan = await this.mealPlanService.GetMealPlan(key);

			// Loop through each food item in the meal plan
			for (const item of meal_plan.items) {
				if (!item.food) continue;
				if (!item.food.recipes) continue;

				// Loop through each recipe attached to food item
				for (const recipe of item.food.recipes) {
					const recipe_data = await this.recipeService.getRecipe(recipe.id);

					// Loop through the ingredients of the recipe
					for (const ingredient of recipe_data.ingredients) {
						if (ingredient.type !== 'to_do') continue;

						const name = ParseIngredientName(ingredient.text);
						if (name === "") continue;

						const existing = shopping_list.find(i => i.item.toLowerCase() === name.toLowerCase());
						if (existing) continue;

						const ignore = ignoredItems.find(i => i.item.toLowerCase() === name.toLowerCase());
						if (ignore) continue;

						// Add to shopping list
						let shoppingListItem = this.shoppingListRepo.create({
							item: name,
							checked: false,
						});
						shoppingListItem = await this.shoppingListRepo.save(shoppingListItem);
						shopping_list.push(shoppingListItem);
					}
				}
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