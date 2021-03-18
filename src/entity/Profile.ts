import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Transaction } from "../entity/Transaction";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number

  @Column("double")
  balance: number

  @Column("varchar")
  currency: string

  @OneToMany(() => Transaction, (transaction: Transaction) => transaction.profile)
    transactions: Transaction[];
}
