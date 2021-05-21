import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const getAll = async (profileId: string) => {
  const categories = await prisma.category.findMany({
    where: { profileId },
  })
  return categories
}

export const getCategory = async (categoryId: string) => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId },
  })

  return category
}

export const create = async (profileId: string, categoryParams: any) => {
  const category = await prisma.category.create({
    data: { ...categoryParams, profileId },
  })

  return category
}

export const update = async (categoryId: string, categoryDetails: any) => {
  const updatedCategory = prisma.category.update({
    where: { id: categoryId },
    data: categoryDetails,
  })

  return updatedCategory
}

export const destroy = async (categoryId: string) => {
  await prisma.category.delete({ where: { id: categoryId } })
}
