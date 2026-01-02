import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { Food } from '../food/food.entity';

import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';

@Module({
    imports: [TypeOrmModule.forFeature([Food])],
    controllers: [RecipeController],
    providers: [RecipeService, ConfigService],
})
export class RecipeModule { }
