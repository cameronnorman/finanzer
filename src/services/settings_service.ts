export const getSettings = (prisma: any, settingsId: string) => {
  return prisma.setting.findFirst({ where: { id: settingsId } })
}

export const createSettings = (prisma: any, profileId: string) => {
  const settingDetails: any = { data: { payment_day: 28 } }
  settingDetails.Profile = { connect: { id: profileId } }
  return prisma.setting.create({ data: settingDetails })
}

export const updateSettings = (
  prisma: any,
  settingsId: string,
  settingsDetails: any
) => {
  return prisma.setting.update({
    where: { id: settingsId },
    data: settingsDetails,
  })
}

export const deleteManySettings = (prisma: any) => {
  return prisma.setting.deleteMany()
}
