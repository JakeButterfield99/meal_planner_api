import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";

import { BlockObjectResponse, Client, PageObjectResponse } from "@notionhq/client";

import { Food } from "../food/food.entity";
import { Recipe, RecipeContents, RecipeData } from "./recipe.type";

enum RecipeMode {
    INGREDIENTS,
    METHOD,
}

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

    async GetDataBatch(id: string, cursor: string | undefined) {
        return await this.notion.blocks.children.list({
            block_id: id,
            start_cursor: cursor,
        })
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

    async getRecipe(id: string) {
        let cursor: string | undefined = undefined;

        let ingredients: RecipeData[] = [];
        let method: RecipeData[] = [];

        do {
            const batch = await this.GetDataBatch(id, cursor);

            let mode: RecipeMode = RecipeMode.INGREDIENTS;

            batch.results.forEach((val: BlockObjectResponse) => {
                if (val.type === 'paragraph') {
                    if (val.paragraph.rich_text.length === 0) return;

                    const text = val.paragraph.rich_text[0].plain_text;

                    if (text.includes('Ingredients')) {
                        mode = RecipeMode.INGREDIENTS;
                        return;
                    }
                    else if (text.includes('Method')) {
                        mode = RecipeMode.METHOD;
                        return;
                    }

                    if (mode === RecipeMode.INGREDIENTS)
                        ingredients.push({ text: text, type: val.type });
                    else if (mode === RecipeMode.METHOD)
                        method.push({ text: text, type: val.type });
                };

                if (val.type === 'to_do') {
                    if (val.to_do.rich_text.length === 0) return;
                    ingredients.push({
                        text: val.to_do.rich_text[0].plain_text,
                        type: val.type
                    });
                };

                if (val.type === 'numbered_list_item') {
                    if (val.numbered_list_item.rich_text.length === 0) return;
                    method.push({
                        text: val.numbered_list_item.rich_text[0].plain_text,
                        type: val.type
                    });
                }
            });

            cursor = batch.has_more ? batch.next_cursor! : undefined;
        } while (cursor !== undefined);

        const contents: RecipeContents = {
            ingredients: ingredients,
            method: method,
        };

        return contents;
    }
}