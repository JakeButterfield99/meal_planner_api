import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';

import { MealType, PlanItem } from '../meal_plan/entities/plan_item.entity';
import { Recipe } from '../recipes/recipe.type';

@Entity()
export class Food {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    image?: string;

    @Column()
    name: string;

    @Column({ type: "jsonb", nullable: true })
    tags: MealType[];

    @Column({ type: "jsonb", nullable: true })
    recipes: Recipe[];

    @OneToMany(() => PlanItem, planItem => planItem.food)
    planItems: PlanItem[];
}