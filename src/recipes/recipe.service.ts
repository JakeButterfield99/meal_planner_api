import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";

import { Client, PageObjectResponse } from "@notionhq/client";

import { Food } from "../food/food.entity";
import { Recipe } from "./recipe.type";

@Injectable()
export class RecipeService {
    recipeBookId: string;
    notion: Client;

    constructor(
        @InjectRepository(Food)
        private readonly foodRepo: Repository<Food>,

        private configService: ConfigService,
    ) {
        this.recipeBookId = this.configService.get<string>('NOTION_RECIPE_BOOK_ID')!;
        this.notion = new Client({
            auth: this.configService.get<string>('NOTION_API_SECRET')
        })
    }

    async GetRecipeBatch(cursor: string | undefined) {
        return await this.notion.dataSources.query({
            data_source_id: this.recipeBookId,
            start_cursor: cursor,
        });
    }

    async getAll() {
        let recipes: Recipe[] = [];
        let cursor: string | undefined = undefined;

        do {
            const batch = await this.GetRecipeBatch(cursor);
            const parsedBatch = batch.results.reduce(function (result: Recipe[], val: PageObjectResponse) {
                if (val.object !== 'page') return result;
                if (val.properties['Name'].type !== 'title') return result;

                return [...result, {
                    id: val.id,
                    name: val.properties.Name.title[0].plain_text,
                }];
            }, []);

            recipes = [...recipes, ...parsedBatch];
            cursor = batch.has_more ? batch.next_cursor! : undefined;

        } while (cursor !== undefined);

        return recipes;
    }
}