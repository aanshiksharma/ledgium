"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type {
  HouseholdMember,
  HouseholdRole,
} from "@/features/households/types/household.types"
import type { UpdateMemberRoleInput } from "../types/member.types"
import { EditMemberRole } from "./edit-member-role"

type Props = {
  member: HouseholdMember
  currentUserId: string | null
  canChangeRoles: boolean
  canRemove: boolean
  isMutating: boolean
  onUpdateRole: (userId: string, input: UpdateMemberRoleInput) => Promise<void>
  onRemove: (userId: string) => Promise<void>
}

function roleLabel(role: HouseholdRole) {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

export function MemberRow({
  member,
  currentUserId,
  canChangeRoles,
  canRemove,
  isMutating,
  onUpdateRole,
  onRemove,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const isCurrentUser = member.userId === currentUserId

  async function handleRemove() {
    if (!window.confirm(
      `Remove ${member.user.name} from this household? This cannot be undone.`
    )) return

    try {
      await onRemove(member.userId)
    } catch {
      // The page displays mutation errors.
    }
  }

  return (
    <div className="grid gap-4 border-b p-4 last:border-b-0 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_120px_minmax(180px,1fr)] md:items-center">
      <div className="min-w-0">
        <p className="truncate font-medium">
          {member.user.name}
          {isCurrentUser ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">You</span>
          ) : null}
        </p>
        <p className="truncate text-sm text-muted-foreground md:hidden">{member.user.email}</p>
      </div>
      <p className="hidden truncate text-sm text-muted-foreground md:block">{member.user.email}</p>
      <div>
        <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">
          {roleLabel(member.role)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {isEditing ? (
          <EditMemberRole
            member={member}
            isSubmitting={isMutating}
            onSubmit={async (userId, input) => {
              await onUpdateRole(userId, input)
              setIsEditing(false)
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            {canChangeRoles && member.role !== "OWNER" ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={isMutating}>
                Change role
              </Button>
            ) : null}
            {canRemove ? (
              <Button type="button" variant="destructive" size="sm" onClick={() => void handleRemove()} disabled={isMutating}>
                {isMutating ? "Removing..." : "Remove"}
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
