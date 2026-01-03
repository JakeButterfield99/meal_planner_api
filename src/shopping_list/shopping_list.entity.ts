import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ShoppingList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    item: string;

    @Column({ default: false })
    checked: boolean;
}