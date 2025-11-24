import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { PlanItem } from './plan_item.entity';

@Entity()
export class MealPlan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    monday: string; // Stored as YYYY-MM-DD

    @OneToMany(() => PlanItem, planItem => planItem.mealPlan, { cascade: true, eager: true })
    items: PlanItem[];
}