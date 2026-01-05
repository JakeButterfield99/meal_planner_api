import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ShoppingListService } from "./shopping_list.service";
import { AddIngredientToListDto, RemoveIgnoredItemDto, UpdateListDto } from "./shopping_list.dto";

@Controller("shopping_list")
export class ShoppingListController {
    constructor(
        private readonly shoppingListService: ShoppingListService,
    ) { }

    @Get()
    GetShoppingList() {
        return this.shoppingListService.GetShoppingList();
    }

    @Patch()
    UpdateShoppingList(@Body() dto: UpdateListDto) {
        return this.shoppingListService.UpdateShoppingList(dto);
    }

    @Delete()
    ClearList() {
        return this.shoppingListService.ClearList();
    }

    @Post('/add')
    AddIngredientToList(@Body() dto: AddIngredientToListDto) {
        return this.shoppingListService.AddIngredientToList(dto);
    }

    @Post('/generate')
    GenerateList() {
        return this.shoppingListService.GenerateList();
    }

    @Post('/anylist')
    AddToAnylist() {
        return this.shoppingListService.AddToAnyList();
    }

    @Get('/ignored')
    GetIgnoredItems() {
        return this.shoppingListService.GetIgnoredItems();
    }

    @Delete('/ignored/:id')
    RemoveIgnoredItem(@Param('id') id: string) {
        return this.shoppingListService.RemoveIgnoredItem(Number(id));
    }
}