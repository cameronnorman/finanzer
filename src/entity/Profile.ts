import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Transaction } from "../entity/Transaction";
import { Category } from "../entity/Category";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  email: string;

  @Column("double")
  balance: number;

  @Column("varchar")
  currency: string;

  @OneToMany(
    () => Transaction,
    (transaction: Transaction) => transaction.profile
  )
  transactions: Transaction[];

  @OneToMany(() => Category, (category: Category) => category.profile)
  categories: Category[];
}
