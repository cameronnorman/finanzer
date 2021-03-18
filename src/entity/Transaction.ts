import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Profile } from "../entity/Profile"

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number

  @Column("varchar")
  description: string

  @Column("double")
  amount: string

  @Column("boolean")
  recurring: boolean

  @Column("varchar")
  recurringType: string

  @Column("integer")
  day: number

  @Column("varchar")
  currency: string

  @ManyToOne(() => Profile, (profile: Profile) => profile.transactions)
    profile: Profile;
}
