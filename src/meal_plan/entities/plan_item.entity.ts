import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { MealPlan } from './meal_plan.entity';
import { Food } from 'src/food/food.entity';

export enum MealType {
    BREAKFAST,
    LUNCH,
    DINNER,
    SNACK,
}

@Entity()
export class PlanItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: string;  // Stored as YYYY-MM-DD

    @Column({ nullable: true })
    assigned: string;

    @Column({ nullable: true })
    notes: string;

    @Column({
        type: 'enum',
        enum: MealType,
        nullable: true
    })
    type: MealType;

    // Relations
    @ManyToOne(() => Food, meal => meal.planItems, {
        eager: true,
        onDelete: "CASCADE",
        nullable: true,
    })
    food: Food;

    @ManyToOne(() => MealPlan, mealPlan => mealPlan.items, { onDelete: 'CASCADE' })
    mealPlan: MealPlan;
}