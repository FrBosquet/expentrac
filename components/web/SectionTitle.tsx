interface Props { children: React.ReactNode }

export const SectionTitle = ({ children }: Props) => {
  return <h1 className='absolute left-0 top-0 uppercase tracking-wider font-semibold text-6xl opacity-25 blur-sm'>{children}</h1>
}
