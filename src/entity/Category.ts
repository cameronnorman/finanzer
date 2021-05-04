import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Transaction } from "../entity/Transaction";
import { Profile } from "../entity/Profile";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  name: string;

  @OneToMany(
    () => Transaction,
    (transaction: Transaction) => transaction.category
  )
  transactions: Transaction[];

  @ManyToOne(() => Profile, (profile: Profile) => profile.categories)
  profile: Profile;
}
