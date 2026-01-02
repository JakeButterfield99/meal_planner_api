import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { RecipeService } from "./recipe.service";

@Controller("recipe")
export class RecipeController {
    constructor(
        private readonly recipeService: RecipeService
    ) { }

    @Get()
    GetAllRecipes() {
        return this.recipeService.getAll();
    }
}