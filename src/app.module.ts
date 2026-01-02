import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { MealPlanModule } from './meal_plan/meal_plan.module';
import { ShoppingListModule } from './shopping_list/shopping_list.module';
import { FoodModule } from './food/food.module';
import { ImageModule } from './image/image.module';
import { ConfigModule } from '@nestjs/config';
import { RecipeModule } from './recipes/recipe.module';

const DATABASE_CONFIG: TypeOrmModuleOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "password",
  database: "meal_planner",
  autoLoadEntities: true,
  synchronize: true,
}

const IMAGE_CONFIG = {
  rootPath: join(__dirname, '..', 'uploads'),
  serveRoot: '/uploads', // so /uploads/xyz.png is publicly accessible
}

@Module({
  imports: [
    TypeOrmModule.forRoot(DATABASE_CONFIG),
    ServeStaticModule.forRoot(IMAGE_CONFIG),
    ConfigModule.forRoot(),

    FoodModule,
    MealPlanModule,
    ShoppingListModule,
    ImageModule,
    RecipeModule
  ],
})
export class AppModule { }
