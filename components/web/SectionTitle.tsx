interface Props {
  children: React.ReactNode
}

export const SectionTitle = ({ children }: Props) => {
  return (
    <h1 className="absolute left-4 top-0 text-6xl font-semibold uppercase tracking-wider opacity-25 blur-sm">
      {children}
    </h1>
  )
}
