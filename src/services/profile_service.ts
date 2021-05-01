import { getRepository } from "typeorm";

import { Transaction } from "../entity/Transaction";
import { Profile } from "../entity/Profile";

export const getProfile = async (
  profileId: string,
  relations: string[] = ["transactions"]
) => {
  const profileRepository = getRepository(Profile);
  const profile: Profile = await profileRepository.findOne({
    where: { id: profileId },
    relations: relations,
  });

  return profile;
};

export const getNetProfileBalance = async (profile: Profile) => {
  const todayDay = new Date().getDate();
  const transactions = await getRepository(Transaction).find({
    where: { profile },
  });

  let calcNetBalance: number = profile.balance;
  const recurringTransactions: Transaction[] = transactions.filter(
    (transaction: Transaction) => {
      return transaction.recurring === true && transaction.day >= todayDay;
    }
  );
  if (recurringTransactions.length > 0) {
    const transactionAmounts: number[] = recurringTransactions.map(
      (transaction: Transaction) => transaction.amount
    );
    calcNetBalance = transactionAmounts.reduce(
      (currentBalance: number, transactionAmount: number) =>
        (currentBalance += transactionAmount),
      profile.balance
    );
  }

  return calcNetBalance;
};
