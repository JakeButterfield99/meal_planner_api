import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { FoodService } from "./food.service";
import { FoodDto } from "./food.dto";

@Controller("food")
export class FoodController {
    constructor(
        private readonly foodService: FoodService
    ) { }

    @Post()
    CreateFood(@Body() dto: FoodDto) {
        return this.foodService.create(dto);
    }

    @Get()
    GetFood() {
        return this.foodService.findAll();
    }

    @Patch(':id')
    UpdateFood(@Param('id') id: string, @Body() dto: FoodDto) {
        return this.foodService.update(Number(id), dto);
    }

    @Delete(':id')
    DeleteFood(@Param('id') id: string) {
        return this.foodService.delete(Number(id));
    }
}