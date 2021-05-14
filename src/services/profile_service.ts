import { getRepository } from "typeorm"

import { Transaction } from "../entity/Transaction"
import { Profile } from "../entity/Profile"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
export interface ProfileDetails {
  email?: string
  balance?: number
  currency?: string
}

const repository = () => {
  return getRepository(Profile)
}

export const getProfile = (
  profileId: string,
  relations: string[] = ["transactions"]
) => {
  const profile = prisma.profile.findFirst({
    where: { id: profileId },
  })

  return profile
}

export const getProfileByEmail = (profileEmail: string) => {
  return repository()
    .findOne({ where: { email: profileEmail } })
    .then((profile: Profile) => {
      return profile
    })
}

export const createProfile = (profileDetails: any) => {
  return prisma.profile.create({ data: profileDetails })
}

export const updateProfile = (
  profileId: string,
  profileDetails: ProfileDetails
) => {
  return repository().update(profileId, {
    balance: profileDetails.balance,
    currency: profileDetails.currency,
  })
}

export const getNetProfileBalance = async (profile: Profile) => {
  const todayDay = new Date().getDate()
  const transactions = await getRepository(Transaction).find({
    where: { profile },
  })

  let calcNetBalance: number = profile.balance
  const recurringTransactions: Transaction[] = transactions.filter(
    (transaction: Transaction) => {
      return transaction.recurring === true && transaction.day >= todayDay
    }
  )
  if (recurringTransactions.length > 0) {
    const transactionAmounts: number[] = recurringTransactions.map(
      (transaction: Transaction) => transaction.amount
    )
    calcNetBalance = transactionAmounts.reduce(
      (currentBalance: number, transactionAmount: number) =>
        (currentBalance += transactionAmount),
      profile.balance
    )
  }

  return calcNetBalance
}
