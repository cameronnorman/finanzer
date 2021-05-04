import { getRepository } from "typeorm";
import { Category } from "../../src/entity/Category";
import { Profile } from "../../src/entity/Profile";

export const createCategory = async (name: string, profile: Profile) => {
  const categoryRepository = await getRepository(Category);
  return categoryRepository.save({ name: name, profile: profile });
};
