import { Profile } from "../entity/Profile";
import { Category } from "../entity/Category";

export interface TransactionDetails {
  amount?: number,
  day?: number,
  recurring?: boolean,
  description?: string,
  recurringType?: string,
  currency?: string,
  created?: Date,
  updated?: Date,
  profile?: Profile,
  category?: Category,
}
