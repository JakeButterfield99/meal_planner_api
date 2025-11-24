import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';

import { Recipe } from '../meal_plan/entities/recipe.entity';
import { MealType, PlanItem } from '../meal_plan/entities/plan_item.entity';

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

    // Relations
    @ManyToOne(() => Recipe, recipe => recipe.meals, { nullable: true, onDelete: 'SET NULL' })
    recipe?: Recipe;

    @OneToMany(() => PlanItem, planItem => planItem.food)
    planItems: PlanItem[];
}