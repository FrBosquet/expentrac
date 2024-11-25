export enum CONTRACT_TYPE {
  LOAN = 'LOAN',
  SUBSCRIPTION = 'SUBSCRIPTION',
  WORK = 'WORK'
}

export const subscriptionInclude = {
  shares: {
    include: {
      to: true
    }
  },
  providers: {
    include: {
      provider: true
    }
  },
  user: true,
  resources: true,
  periods: true
}
