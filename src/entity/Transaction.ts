import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  description: string;

  @Column("double")
  amount: string;

  @Column("boolean")
  recurring: boolean;

  @Column("varchar")
  recurring_type: string;

  @Column("integer")
  day: number;

  @Column("varchar")
  currency: string;
}
