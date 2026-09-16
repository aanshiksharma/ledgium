"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { HouseholdMember } from "@/features/households/types/household.types"
import type { UpdateMemberRoleInput } from "../types/member.types"

type Props = {
  member: HouseholdMember
  isSubmitting: boolean
  onSubmit: (userId: string, input: UpdateMemberRoleInput) => Promise<void>
  onCancel: () => void
}

export function EditMemberRole({
  member,
  isSubmitting,
  onSubmit,
  onCancel,
}: Props) {
  const [role, setRole] = useState<UpdateMemberRoleInput["role"]>(
    member.role === "ADMIN" ? "ADMIN" : "MEMBER"
  )
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      await onSubmit(member.userId, { role })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to change member role."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      <select
        value={role}
        onChange={(event) =>
          setRole(event.target.value as UpdateMemberRoleInput["role"])
        }
        disabled={isSubmitting}
        aria-label={`Role for ${member.user.name}`}
        className="flex h-9 rounded-md border bg-background px-2 text-sm"
      >
        <option value="MEMBER">Member</option>
        <option value="ADMIN">Admin</option>
      </select>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
