export const getAllCategories = async (prisma: any, profileId: string) => {
  const categories = await prisma.category.findMany({
    where: { profileId },
  })
  return categories
}

export const getCategory = async (prisma: any, categoryId: string) => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId },
  })

  return category
}

export const createCategory = async (
  prisma: any,
  profileId: string,
  categoryParams: any
) => {
  const category = await prisma.category.create({
    data: { ...categoryParams, Profile: { connect: { id: profileId } } },
  })

  return category
}

export const updateCategory = async (
  prisma: any,
  categoryId: string,
  categoryDetails: any
) => {
  const updatedCategory = prisma.category.update({
    where: { id: categoryId },
    data: categoryDetails,
  })

  return updatedCategory
}

export const destroyCategory = async (prisma: any, categoryId: string) => {
  await prisma.category.delete({ where: { id: categoryId } })
}

export const deleteManyCategories = (prisma: any) => {
  return prisma.category.deleteMany()
}
