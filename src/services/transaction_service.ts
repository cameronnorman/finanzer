import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const filterTransactions = (
  profileId: string,
  startDate: string,
  endDate: string,
  offset: number,
  limit: number
) => {
  return prisma.transaction.findMany({
    where: {
      profileId,
      createdAt: {
        gt: new Date(startDate),
        lt: new Date(endDate),
      },
    },
    include: {
      Category: true,
    },
    take: limit,
    skip: offset * limit,
  })
}

export const newTransaction = (transactionDetails: any) => {
  return prisma.transaction.create({ data: transactionDetails })
}

export const createTransaction = (transactionDetails: any) => {
  return prisma.transaction.create({ data: transactionDetails })
}

export const bulkSaveTransactions = async (transactions: any) => {
  return prisma.transaction.createMany({ data: transactions })
}
