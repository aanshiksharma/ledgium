import { ProgressBar } from "@/components/common/progress-bar"
import { useHousehold } from "@/features/households"

export function LoadingHousehold() {
  const { isLoading } = useHousehold()

  return (
    <div className="flex h-full items-center justify-center">
      <ProgressBar loading={isLoading} loadingText="Loading Household..." />
    </div>
  )
}
