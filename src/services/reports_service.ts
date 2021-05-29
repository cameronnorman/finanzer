import { filterTransactions, transactionsFromDate } from "./transaction_service"

interface IDictionary<TValue> {
  [id: string]: TValue
}

type TransactionSummary = {
  year: number
  month: number
  income: number
  expenses: number
}

export const expensesByCategory = async (prisma: any, profileId: string) => {
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

  const transactions = await filterTransactions(
    prisma,
    profileId,
    startDate,
    endDate,
    0,
    1000
  )

  const result: IDictionary<any> = {}

  transactions.forEach((transaction: any) => {
    if (transaction.amount < 0 && transaction.Category != null) {
      if (result[transaction.Category.name.toLowerCase()] === undefined) {
        result[transaction.Category.name.toLowerCase()] = 0
      }
      result[transaction.Category.name.toLowerCase()] += transaction.amount / -1
    }
  })

  return result
}

export const incomeExpenses = async (prisma: any, profileId: string) => {
  const startDate = new Date(new Date().getFullYear(), 0, 1)
    .toISOString()
    .split("T")[0]

  const transactions = await transactionsFromDate(prisma, profileId, startDate)

  const summarized: TransactionSummary[] = []

  transactions.forEach((transaction: any) => {
    const transactionYear = transaction.createdAt.getFullYear()
    const transactionMonth = transaction.createdAt.getMonth() + 1
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
