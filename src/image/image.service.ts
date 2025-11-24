import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import * as util from "util";

import OpenAI from "openai";
import { FoodService } from "src/food/food.service";

const IMAGE_GEN_PROMPT = "Illustration, flat, 2D, vector art made with adobe illustrator of the food: %s. You should use crisp lines. The image should not contain any text.";

@Injectable()
export class ImageService {
    private openai: OpenAI;
    private uploadDir = path.join(__dirname, '..', '..', 'uploads');

    constructor(
        private configService: ConfigService,
        private foodService: FoodService,
    ) {
        const OPEN_AI_KEY = this.configService.get<string>('OPENAI_API_KEY');
        this.openai = new OpenAI({
            apiKey: OPEN_AI_KEY,
        });

        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async GenerateImage(foodId: number): Promise<string> {
        try {
            // Get the food object
            const food = await this.foodService.findOne(foodId);
            if (!food)
                throw new HttpException(`Food not found with ID: ${foodId}`, HttpStatus.NOT_FOUND);

            // Request the image
            const prompt = util.format(IMAGE_GEN_PROMPT, food.name);

            const response = await this.openai.images.generate({
                model: 'gpt-image-1-mini',
                prompt,
                size: '1024x1024',
                quality: 'low',
            });

            if (!response.data) {
                throw new HttpException('No OpenAI data returned', HttpStatus.BAD_GATEWAY);
            }

            const b64 = response.data[0].b64_json;
            if (!b64) {
                throw new HttpException('No b64_json returned from API', HttpStatus.BAD_GATEWAY);
            }

            // Decode base64 into raw image bytes
            const imageBuffer = Buffer.from(b64, 'base64');

            const fileName = `${uuid()}.png`;
            const filePath = path.join(this.uploadDir, fileName);

            // Save the file locally
            fs.writeFileSync(filePath, imageBuffer);

            // Get a local URL (you could also upload to S3, Cloudflare, etc.)
            const publicUrl = `/uploads/${fileName}`;

            // Update the food entry to be the new image
            await this.foodService.update(food.id, {
                image: publicUrl,
            });

            return publicUrl;
        } catch (err) {
            console.error('Image generation failed:', err);
            throw new HttpException('Image generation failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}