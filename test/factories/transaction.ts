export const createTransaction = async (
  category: any,
  profile: any,
  other: any
) => {
  const defaultTransactionDetails: TransactionDetails = {
    amount: 10,
    day: 2,
    recurring: true,
    description: "This is a expensive transaction",
    recurringType: "monthly",
    currency: "EUR",
  }
  const newTransaction: TransactionDetails = {
    ...defaultTransactionDetails,
    ...other,
  }
  newTransaction.profile = profile
  newTransaction.category = category
  const transactionRepository = await getRepository(Transaction)

  return transactionRepository.save(newTransaction)
}
