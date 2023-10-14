// Show

import { Card, CardDescription, CardHeader, CardTitle } from '@components/ui/card'

interface Props {
  className?: string
}

export const Latest = ({ className }: Props) => {
  return <Card>
    <CardHeader>
      <CardTitle>Payments</CardTitle>
      <CardDescription>Recent activity</CardDescription>
    </CardHeader>
  </Card>
}
