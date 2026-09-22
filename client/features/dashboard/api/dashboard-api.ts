import { apiRequest } from "@/lib/api/client"
import type { Dashboard, DashboardFilters } from "../types/dashboard.types"

export async function getDashboard(
  householdId: string,
  filters?: DashboardFilters
): Promise<Dashboard> {
  const params = new URLSearchParams()

  if (filters?.from) params.set("from", filters.from.toString())
  if (filters?.to) params.set("to", filters.to.toString())

  const query = params.toString()

  return apiRequest<Dashboard>(
    `/households/${householdId}/dashboard${query ? `?${query}` : ""}`
  )
}
