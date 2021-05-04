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

export const filterTransactions = (
  profileId: number,
  startDate: string,
  endDate: string,
  offset: number,
  limit: number
) => {
  return getRepository(Transaction)
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

export const createTransaction = async (
  transactionDetails: TransactionDetails
) => {
  const transactionRepository = getRepository(Transaction)
  const transaction = await transactionRepository.save(transactionDetails)
  return transaction
}
