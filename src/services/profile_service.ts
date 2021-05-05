import { getRepository } from "typeorm"

import { Transaction } from "../entity/Transaction"
import { Profile } from "../entity/Profile"

export interface ProfileDetails {
  email?: string
  balance?: number
  currency?: string
}

const repository = () => {
  return getRepository(Profile)
}

export const getProfile = async (
  profileId: string,
  relations: string[] = ["transactions"]
) => {
  const profileRepository = getRepository(Profile)
  const profile: Profile = await profileRepository.findOne({
    where: { id: profileId },
    relations,
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

export const createProfile = (profileDetails: ProfileDetails) => {
  return repository().save(profileDetails)
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
