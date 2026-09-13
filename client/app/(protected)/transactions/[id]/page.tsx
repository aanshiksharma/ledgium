import { TransactionDetail } from "@/features/transactions"

type Props = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <TransactionDetail transactionId={id} />
}
