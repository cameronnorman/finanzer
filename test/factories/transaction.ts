import { getRepository } from "typeorm";
import { Profile } from "../../src/entity/Profile";
import { Category } from "../../src/entity/Category";
import { Transaction } from "../../src/entity/Transaction";
import { TransactionDetails } from "../../src/services/transaction_service";

export const createTransaction = async (
  category: Category,
  profile: Profile,
  other: TransactionDetails
) => {
  const defaultTransactionDetails: TransactionDetails = {
    amount: 10,
    day: 2,
    recurring: true,
    description: "This is a expensive transaction",
    recurringType: "monthly",
    currency: "EUR",
  };
  const newTransaction: TransactionDetails = {
    ...defaultTransactionDetails,
    ...other,
  };
  newTransaction.profile = profile;
  newTransaction.category = category;
  const transactionRepository = await getRepository(Transaction);

  return transactionRepository.save(newTransaction);
};
