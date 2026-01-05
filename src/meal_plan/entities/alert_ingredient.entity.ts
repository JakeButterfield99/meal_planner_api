import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AlertIngredient {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    item: string;
}