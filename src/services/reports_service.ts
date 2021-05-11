import { getRepository } from "typeorm"
import { Transaction } from "../entity/Transaction"

interface IDictionary<TValue> {
  [id: string]: TValue
}

type TransactionSummary = {
  year: number
  month: number
  income: number
  expenses: number
}

export const expensesByCategory = async (profileId: number) => {
  const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0]
  const endDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0]

  const transactions = await getRepository(Transaction)
    .createQueryBuilder("transaction")
    .where(
      "transaction.profileId = :profileId AND transaction.created >= :startDate AND transaction.created <= :endDate",
      { profileId, startDate, endDate }
    )
    .leftJoinAndSelect("transaction.category", "categories")
    .getMany()

  const result: IDictionary<any> = {}

  transactions.forEach((transaction) => {
    if (transaction.amount < 0 && transaction.category != null) {
      if (result[transaction.category.name.toLowerCase()] === undefined) {
        result[transaction.category.name.toLowerCase()] = 0
      }
      result[transaction.category.name.toLowerCase()] += transaction.amount / -1
    }
  })

  return result
}

export const incomeExpenses = async (profileId: number) => {
  const startDate = new Date(new Date().getFullYear(), 0, 1)
    .toISOString()
    .split("T")[0]

  const transactions = await getRepository(Transaction)
    .createQueryBuilder("transaction")
    .where(
      "transaction.profileId = :profileId AND transaction.created >= :startDate",
      { profileId, startDate }
    )
    .getMany()

  const summarized: TransactionSummary[] = []

  transactions.forEach((transaction) => {
    const transactionYear = transaction.created.getFullYear()
    const transactionMonth = transaction.created.getMonth() + 1
    const summaryIndex: number = summarized.findIndex(
      (summary: TransactionSummary) => {
        return (
          summary.year === transactionYear && summary.month === transactionMonth
        )
      }
    )

    if (summaryIndex === -1) {
      if (transaction.amount > 0) {
        summarized.push({
          year: transactionYear,
          month: transactionMonth,
          income: transaction.amount,
          expenses: 0,
        })
      } else {
        summarized.push({
          year: transactionYear,
          month: transactionMonth,
          income: 0,
          expenses: transaction.amount / -1,
        })
      }
    } else {
      if (transaction.amount > 0) {
        summarized[summaryIndex].income =
          typeof summarized[summaryIndex].income === undefined
            ? transaction.amount
            : summarized[summaryIndex].income + transaction.amount
      } else {
        summarized[summaryIndex].expenses =
          typeof summarized[summaryIndex].expenses === undefined
            ? transaction.amount
            : summarized[summaryIndex].expenses + transaction.amount / -1
      }
    }
  })

  return summarized
}
