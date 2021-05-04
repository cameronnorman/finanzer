import { Profile } from "../entity/Profile"
import { Category } from "../entity/Category"
import { getRepository } from "typeorm"

export interface CategoryDetails {
  name: string
  profile: Profile
}

export const getAll = async (profileId: string) => {
  const profileRepository = await getRepository(Profile)
  const profile = await profileRepository.findOne({
    where: { id: profileId },
    relations: ["categories"],
  })

  if (!profile) {
    throw new Error("Profile not found")
  }

  return profile.categories
}

export const getCategory = async (categoryId: string) => {
  const categoryRepository = await getRepository(Category)
  const category = await categoryRepository.findOne(categoryId)
  return category
}

export const create = async (profileId: string, categoryParams: any) => {
  const profileRepository = await getRepository(Profile)
  const profile = await profileRepository.findOne(profileId)

  const categoryRepository = await getRepository(Category)
  const categoryDetails: CategoryDetails = {
    name: categoryParams.name,
    profile,
  }
  const category = categoryRepository.save(categoryDetails)

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
