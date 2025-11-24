import { Controller, Get, Query } from "@nestjs/common";
import { ImageService } from "./image.service";

@Controller("image")
export class ImageController {
    constructor(
        private readonly imageService: ImageService
    ) { }

    @Get()
    async GenerateImage(@Query('foodId') foodId: number) {
        if (!foodId) {
            return { error: 'Food ID is required' };
        }

        const imageUrl = await this.imageService.GenerateImage(foodId);
        return { imageUrl };
    }
}