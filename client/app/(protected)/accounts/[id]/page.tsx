import { AccountDetail } from "@/features/accounts"

type AccountDetailRouteProps = {
  params: Promise<{ id: string }>
}

export default async function AccountDetailRoute({
  params,
}: AccountDetailRouteProps) {
  const { id } = await params

  return <AccountDetail accountId={id} />
}
