import { Food } from 'src/food/food.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class Recipe {
    @PrimaryGeneratedColumn()
    id: number;

    // Using JSON type for Postgres
    @Column({ type: 'jsonb' })
    ingredients: any;

    @Column({ type: 'jsonb' })
    method: any;

    @Column({ type: 'int', nullable: true })
    oven_temp?: number;

    // Relations
    @OneToMany(() => Food, food => food.recipe)
    meals: Food[];
}