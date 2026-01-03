import { Body, Controller, Get, Post } from "@nestjs/common";
import { ShoppingListService } from "./shopping_list.service";
import { GenerateListDto } from "./shopping_list.dto";

@Controller("shopping_list")
export class ShoppingListController {
    constructor(
        private readonly shoppingListService: ShoppingListService,
    ) { }

    @Get()
    GetShoppingList() {
        return this.shoppingListService.GetShoppingList();
    }

    @Post()
    GenerateList(@Body() dto: GenerateListDto) {
        return this.shoppingListService.GenerateList(dto);
    }
}