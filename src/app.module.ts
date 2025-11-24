import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { MealPlanModule } from './meal_plan/meal_plan.module';
import { ShoppingListModule } from './shopping_list/shopping_list.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { FoodModule } from './food/food.module';
import { ImageModule } from './image/image.module';
import { ConfigModule } from '@nestjs/config';

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
    ImageModule
  ],
})
export class AppModule { }
