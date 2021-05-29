export const filterTransactions = (
  prisma: any,
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

export const transactionsFromDate = (
  prisma: any,
  profileId: string,
  startDate: string
) => {
  return prisma.transaction.findMany({
    where: {
      profileId,
      createdAt: {
        gt: new Date(startDate),
      },
    },
  })
}

export const getTransactions = (prisma: any) => {
  return prisma.transaction.findMany({})
}

export const getTransaction = (prisma: any, transactionId: string) => {
  return prisma.transaction.findFirst({ where: { id: transactionId } })
}

export const newTransaction = (prisma: any, transactionDetails: any) => {
  return prisma.transaction.create({ data: transactionDetails })
}

export const createTransaction = (
  prisma: any,
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
  prisma: any,
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

export const deleteTransaction = (prisma: any, transactionId: string) => {
  return prisma.transaction.delete({ where: { id: transactionId } })
}

export const deleteManyTransactions = (prisma: any) => {
  return prisma.transaction.deleteMany()
}

export const bulkSaveTransactions = async (prisma: any, transactions: any) => {
  return prisma.transaction.createMany({ data: transactions })
}
