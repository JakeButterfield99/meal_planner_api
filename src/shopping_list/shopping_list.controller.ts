import { Body, Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { ShoppingListService } from "./shopping_list.service";
import { GenerateListDto, UpdateListDto } from "./shopping_list.dto";

@Controller("shopping_list")
export class ShoppingListController {
    constructor(
        private readonly shoppingListService: ShoppingListService,
    ) { }

    @Get()
    GetShoppingList() {
        return this.shoppingListService.GetShoppingList();
    }

    @Get('/ignored')
    GetIgnoredItems() {
        return this.shoppingListService.GetIgnoredItems();
    }

    @Patch()
    UpdateShoppingList(@Body() dto: UpdateListDto) {
        return this.shoppingListService.UpdateShoppingList(dto);
    }

    @Post('/generate')
    GenerateList(@Body() dto: GenerateListDto) {
        return this.shoppingListService.GenerateList(dto);
    }

    @Post('/anylist')
    AddToAnylist() {
        return this.shoppingListService.AddToAnyList();
    }

    @Delete()
    ClearList() {
        return this.shoppingListService.ClearList();
    }
}