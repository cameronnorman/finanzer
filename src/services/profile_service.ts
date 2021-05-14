import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
export interface ProfileDetails {
  email?: string
  balance?: number
  currency?: string
}

export const getProfile = async (
  profileId: string,
  include = { transactions: false, categories: false },
  getNetBalance = false
) => {
  const profile = await prisma.profile.findFirst({
    where: { id: profileId },
    include,
  })

  if (getNetBalance) {
    return { ...profile, netBalance: getNetProfileBalance(profile) }
  }

  return profile
}

export const getProfileByEmail = async (profileEmail: string) => {
  const profile = await prisma.profile.findFirst({
    where: { email: profileEmail },
  })

  return profile
}

export const createProfile = (profileDetails: any) => {
  return prisma.profile.create({ data: profileDetails })
}

export const updateProfile = (
  profileId: string,
  profileDetails: ProfileDetails
) => {
  return prisma.profile.update({
    where: { id: profileId },
    data: {
      balance: profileDetails.balance,
      currency: profileDetails.currency,
    },
  })
}

export const getNetProfileBalance = async (profile: any) => {
  const todayDay = new Date().getDate()
  const transactions = await prisma.transaction.findMany({
    where: { profileId: profile.id },
  })

  let calcNetBalance: number = profile.balance
  const recurringTransactions: any[] = transactions.filter(
    (transaction: any) => {
      return transaction.recurring === true && transaction.day >= todayDay
    }
  )
  if (recurringTransactions.length > 0) {
    const transactionAmounts: number[] = recurringTransactions.map(
      (transaction: any) => transaction.amount
    )
    calcNetBalance = transactionAmounts.reduce(
      (currentBalance: number, transactionAmount: number) =>
        (currentBalance += transactionAmount),
      profile.balance
    )
  }

  return calcNetBalance
}
