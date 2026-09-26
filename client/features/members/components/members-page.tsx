"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { useHousehold } from "@/providers/household-provider"
import { useMembers } from "../hooks/use-members"
import { AddMemberForm } from "./add-member-form"
import { MemberList } from "./member-list"
import type {
  HouseholdMember,
  HouseholdRole,
} from "@/features/households/types/household.types"

export function MembersPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const {
    currentHousehold,
    isLoading: isHouseholdLoading,
    households,
  } = useHousehold()

  const {
    isLoading,
    isMutating,
    error,
    refresh,
    addMember,
    updateMemberRole,
    removeMember,
  } = useMembers()

  const [showAddForm, setShowAddForm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (isAuthLoading || isHouseholdLoading) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <h1 className="text-2xl font-bold">Members</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Loading household...
        </p>
      </section>
    )
  }

  if (households.length === 0) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <h1 className="text-2xl font-bold">Members</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create or select a household before managing members.
        </p>
      </section>
    )
  }

  if (!currentHousehold) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <h1 className="text-2xl font-bold">Members</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No household is currently selected.
        </p>
      </section>
    )
  }

  const currentUserRole: HouseholdRole =
    currentHousehold.members[0]?.role ?? "MEMBER"
  const canAddMembers =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN"
  const canAddAdmin = currentUserRole === "OWNER"
  const canChangeRoles = currentUserRole === "OWNER"

  function canRemoveMember(member: HouseholdMember) {
    if (!canAddMembers || member.role === "OWNER") return false
    if (currentUserRole === "ADMIN" && member.role === "ADMIN") return false
    return true
  }

  async function handleAddMember(input: Parameters<typeof addMember>[0]) {
    setActionError(null)
    try {
      await addMember(input)
      setShowAddForm(false)
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to add member."
      )
    }
  }

  async function handleUpdateRole(
    userId: string,
    input: Parameters<typeof updateMemberRole>[1]
  ) {
    setActionError(null)
    try {
      await updateMemberRole(userId, input)
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to change member role."
      )
      throw requestError
    }
  }

  async function handleRemove(userId: string) {
    setActionError(null)
    try {
      await removeMember(userId)
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to remove member."
      )
      throw requestError
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage who has access to {currentHousehold.name}.
          </p>
        </div>
        {canAddMembers ? (
          <Button
            type="button"
            onClick={() => {
              setActionError(null)
              setShowAddForm((current) => !current)
            }}
            disabled={isMutating}
          >
            {showAddForm ? "Cancel" : "Add member"}
          </Button>
        ) : null}
      </header>

      {showAddForm ? (
        <AddMemberForm
          canAddAdmin={canAddAdmin}
          isSubmitting={isMutating}
          onSubmit={handleAddMember}
          onCancel={() => setShowAddForm(false)}
        />
      ) : null}

      {error || actionError ? (
        <div className="rounded-xl border border-destructive/30 p-4 text-sm">
          <p role="alert">{actionError ?? error}</p>
          {!isLoading ? (
            <button
              type="button"
              className="mt-2 font-medium underline"
              onClick={() => {
                setActionError(null)
                void refresh()
              }}
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      <MemberList
        currentUserId={user?.id ?? null}
        canChangeRoles={canChangeRoles}
        canRemoveMember={canRemoveMember}
        isMutating={isMutating}
        onUpdateRole={handleUpdateRole}
        onRemove={handleRemove}
      />
    </section>
  )
}
