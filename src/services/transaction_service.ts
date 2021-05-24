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

export const transactionsFromDate = (profileId: string, startDate: string) => {
  return prisma.transaction.findMany({
    where: {
      profileId,
      createdAt: {
        gt: new Date(startDate),
      },
    },
  })
}

export const getTransactions = () => {
  return prisma.transaction.findMany({})
}

export const getTransaction = (transactionId: string) => {
  return prisma.transaction.findFirst({ where: { id: transactionId } })
}

export const newTransaction = (transactionDetails: any) => {
  return prisma.transaction.create({ data: transactionDetails })
}

export const createTransaction = (
  profileId: any,
  categoryId: any,
  transactionDetails: any
) => {
  transactionDetails.Profile = { connect: { id: profileId } }
  if (categoryId) {
    transactionDetails.Category = { connect: { id: categoryId } }
  }
  return prisma.transaction.create({
    data: transactionDetails,
  })
}

export const updateTransaction = (
  profileId: string,
  categoryId: string,
  transactionId: string,
  transactionDetails: any
) => {
  transactionDetails.Profile = { connect: { id: profileId } }
  if (categoryId) {
    transactionDetails.Category = { connect: { id: categoryId } }
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data: transactionDetails,
  })
}

export const deleteTransaction = (transactionId: string) => {
  return prisma.transaction.delete({ where: { id: transactionId } })
}

export const deleteManyTransactions = () => {
  return prisma.transaction.deleteMany()
}

export const bulkSaveTransactions = async (transactions: any) => {
  return prisma.transaction.createMany({ data: transactions })
}
