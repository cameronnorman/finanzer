import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Profile } from "../entity/Profile";
import { Category } from "../entity/Category";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  description: string;

  @Column("double")
  amount: number;

  @Column("boolean")
  recurring: boolean;

  @Column("varchar")
  recurringType: string;

  @Column("integer")
  day: number;

  @Column("varchar")
  currency: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @ManyToOne(() => Profile, (profile: Profile) => profile.transactions)
  profile: Profile;

  @ManyToOne(() => Category, (category: Category) => category.transactions)
  category: Category;
}
