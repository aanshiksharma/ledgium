"use client"

import {
  type HouseholdMember,
  type UpdateMemberRoleInput,
  useMembers,
} from "@/features/members"
import { MemberRow } from "./member-row"

type Props = {
  currentUserId: string | null
  canChangeRoles: boolean
  isMutating: boolean
  canRemoveMember: (member: HouseholdMember) => boolean
  onUpdateRole: (userId: string, input: UpdateMemberRoleInput) => Promise<void>
  onRemove: (userId: string) => Promise<void>
}

export function MemberList({
  currentUserId,
  canChangeRoles,
  isMutating,
  canRemoveMember,
  onUpdateRole,
  onRemove,
}: Props) {
  const { members, isLoading } = useMembers()

  if (isLoading) return <>Loading members...</>

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border p-6">
        <p className="text-sm text-muted-foreground">
          No household members were found.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="hidden border-b bg-muted/40 px-4 py-3 text-sm font-medium md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_120px_minmax(180px,1fr)]">
        <span>Name</span>
        <span>Email</span>
        <span>Role</span>
        <span>Actions</span>
      </div>

      {members.map((member) => (
        <MemberRow
          key={member.id}
          member={member}
          currentUserId={currentUserId}
          canChangeRoles={canChangeRoles}
          canRemove={canRemoveMember(member)}
          isMutating={isMutating}
          onUpdateRole={onUpdateRole}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
