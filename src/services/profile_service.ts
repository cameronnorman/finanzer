import { Transaction } from "../entity/Transaction";
import { Profile } from "../entity/Profile";

const getNetProfileBalance = async (profile: Profile) => {
  const todayDay = (new Date().getDate())

  let calcNetBalance: number = profile.balance
  const recurringTransactions: Transaction[] = profile.transactions.filter((transaction: Transaction) => {
    return (transaction.recurring === true && transaction.day >= todayDay)
  })
  if (recurringTransactions.length > 0) {
    const transactionAmounts: number[] = recurringTransactions.map((transaction: Transaction) => transaction.amount)
    calcNetBalance = transactionAmounts.reduce((currentBalance: number, transactionAmount: number) => currentBalance += transactionAmount, profile.balance)
  }

  return {
    id: profile.id,
    currency: profile.currency,
    balance: profile.balance,
    netBalance: calcNetBalance
  }
}

export default getNetProfileBalance
