import { Loan, Provider, Subscription, UserProvider } from "@prisma/client"

export type LoanExtendedInfo = {
  totalAmount: number;
  paidAmount: number;
  owedAmount: number;

  payments: number;
  paymentsDone: number;
  paymentsLeft: number;

  vendor?: Provider;
}

export type BrandExtendedInfo = {
  name: string;
  domain: string;
  claimed: boolean;
  description: string;
  links: Link[];
  logos: Logo[];
  colors: Color[];
  fonts: Font[];
  images: Image[];
}

export type Color = {
  hex: string;
  type: string;
  brightness: number;
}

export type Font = {
  name: string;
  type: string;
  origin: string;
  originId: null;
  weights: any[];
}

export type Image = {
  formats: FormatElement[];
  tags: any[];
  type: string;
}

export type FormatElement = {
  src: string;
  background: null | string;
  format: FormatEnum;
  height?: number;
  width?: number;
  size: number;
}

export enum FormatEnum {
  JPEG = "jpeg",
  PNG = "png",
  SVG = "svg",
}

export type Link = {
  name: string;
  url: string;
}

export type Logo = {
  theme: string;
  formats: FormatElement[];
  tags: any[];
  type: string;
}

export type ProviderFetched = Required<Omit<Provider, 'isFetched'>> & { isFetched: true }
export type ProviderUnfetched = { isFetched: false } & Pick<Provider, 'id' | 'name'>

export type LoanComplete = Loan & {
  vendor?: UserProvider & { provider: Provider };
  platform?: UserProvider & { provider: Provider };
  lender?: UserProvider & { provider: Provider };
}

export type UserProviderComplete = UserProvider & {
  provider: Provider
}

export type SubscriptionComplete = Subscription & {
  vendor?: UserProvider & { provider: Provider };
  platform?: UserProvider & { provider: Provider };
}