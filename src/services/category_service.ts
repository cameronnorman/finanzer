import { Profile } from "../entity/Profile"
import { Category } from "../entity/Category"
import { getRepository } from "typeorm"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
export interface CategoryDetails {
  name: string
  profile: Profile
}

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
  const categoryRepository = await getRepository(Category)
  await categoryRepository.update(categoryId, { name: categoryDetails.name })

  return categoryRepository.findOne({ where: { id: categoryId } })
}

export const destroy = async (categoryId: string) => {
  const categoryRepository = await getRepository(Category)
  return categoryRepository.delete(categoryId)
}
