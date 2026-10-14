'use server'

import { type Contract } from '@lib/models'
import { changeSubscriptionPeriod } from '@lib/server/subscription-periods'

export const pauseSubscription = async (
  formData: FormData
): Promise<Contract> => changeSubscriptionPeriod(formData, 'pause')
export const updateSubscriptionPrice = async (
  formData: FormData
): Promise<Contract> => changeSubscriptionPeriod(formData, 'price')
export const resumeSubscription = async (
  formData: FormData
): Promise<Contract> => changeSubscriptionPeriod(formData, 'resume')
