# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

- Keep `internalTrackerHostId` and `internalTrackerPort` in `startos/utils.ts` as they are:
  dependents resolve the internal tracker port by them.
- Don't add `proxy` to the `internal-tracker` binding: StartOS's proxy would replace the
  dependent's `X-Forwarded-For` with the dependent's container address.
