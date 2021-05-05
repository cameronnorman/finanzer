import { getRepository } from "typeorm"

import { Profile } from "../entity/Profile"
import { Transaction } from "../entity/Transaction"
import { Category } from "../entity/Category"

export interface TransactionDetails {
  amount?: number
  day?: number
  recurring?: boolean
  description?: string
  recurringType?: string
  currency?: string
  created?: Date
  updated?: Date
  profile?: Profile
  category?: Category
}
const repository = () => {
  return getRepository(Transaction)
}

export const filterTransactions = (
  profileId: number,
  startDate: string,
  endDate: string,
  offset: number,
  limit: number
) => {
  return repository()
    .createQueryBuilder("transaction")
    .where(
      "transaction.profileId = :profileId AND transaction.created >= :startDate AND transaction.created <= :endDate",
      { profileId, startDate, endDate }
    )
    .leftJoinAndSelect("transaction.category", "categories")
    .limit(limit)
    .offset(offset * limit)
    .getMany()
}

export const newTransaction = (transactionDetails: TransactionDetails) => {
  return repository().create(transactionDetails)
}

export const createTransaction = (transactionDetails: TransactionDetails) => {
  return repository()
    .save(transactionDetails)
    .then((transaction: Transaction) => {
      return transaction
    })
}

export const bulkSaveTransactions = async (transactions: Transaction[]) => {
  return repository().save(transactions)
}
