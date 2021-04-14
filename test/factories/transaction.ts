import { getRepository } from "typeorm";
import { Profile } from "../../src/entity/Profile";
import { Category } from "../../src/entity/Category";
import { Transaction } from "../../src/entity/Transaction";

export const createTransaction = async (category: Category, profile: Profile) => {
  const transactionRepository = await getRepository(Transaction)
  return transactionRepository.save({
    amount: 10,
    day: 2,
    recurring: true,
    description: "This is a expensive transaction",
    recurringType: "monthly",
    currency: "EUR",
    profile: profile,
    category: category})
}
