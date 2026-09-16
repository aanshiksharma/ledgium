"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AddMemberInput } from "../types/member.types"

type Props = {
  canAddAdmin: boolean
  isSubmitting: boolean
  onSubmit: (input: AddMemberInput) => Promise<void>
  onCancel: () => void
}

export function AddMemberForm({
  canAddAdmin,
  isSubmitting,
  onSubmit,
  onCancel,
}: Props) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<AddMemberInput["role"]>("MEMBER")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError("Email is required.")
      return
    }
    setError(null)
    try {
      await onSubmit({ email: normalizedEmail, role })
      setEmail("")
      setRole("MEMBER")
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to add member."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-5">
      <div>
        <h2 className="font-semibold">Add member</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add an existing Ledgium user to this household.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 p-3 text-sm" role="alert">
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="member-email">Email</Label>
        <Input
          id="member-email"
          type="email"
          value={email}
          maxLength={254}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="e.g. person@example.com"
          autoComplete="email"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="member-role">Role</Label>
        <select
          id="member-role"
          value={role}
          onChange={(event) =>
            setRole(event.target.value as AddMemberInput["role"])
          }
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="MEMBER">Member</option>
          {canAddAdmin ? <option value="ADMIN">Admin</option> : null}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || !email.trim()}>
          {isSubmitting ? "Adding..." : "Add member"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
