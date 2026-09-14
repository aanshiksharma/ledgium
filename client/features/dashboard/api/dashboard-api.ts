import { apiRequest } from "@/lib/api/client"
import type { Dashboard, DashboardFilters } from "../types/dashboard.types"

export async function getDashboard(
  householdId: string,
  filters?: DashboardFilters
): Promise<Dashboard> {
  const params = new URLSearchParams()

  if (filters?.from) params.set("from", filters.from)
  if (filters?.to) params.set("to", filters.to)

  const query = params.toString()

  return apiRequest<Dashboard>(
    `/households/${householdId}/dashboard${query ? `?${query}` : ""}`
  )
}
