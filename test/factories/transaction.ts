import { createTransaction } from "../../src/services/transaction_service"

export const createTransactionFactory = async (
  prisma: any,
  category: any,
  profile: any,
  other: any
) => {
  const defaultTransactionDetails: any = {
    amount: 10,
    day: 2,
    recurring: true,
    description: "This is a expensive transaction",
    recurringType: "monthly",
    currency: "EUR",
  }
  const newTransaction: any = {
    ...defaultTransactionDetails,
    ...other,
  }

  return createTransaction(prisma, profile.id, category.id, newTransaction)
}
