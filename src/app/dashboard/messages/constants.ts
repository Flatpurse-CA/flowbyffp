// Sentinel keys used in place of a real staff_id for the two special
// threads every member of a shop can reach: the shared team channel, and —
// from a staff member's point of view — their own 1:1 with the owner.
// Kept out of actions.ts because a "use server" module may only export
// async functions, not plain constants.
export const TEAM_CHANNEL_KEY = "__team__";
export const OWNER_THREAD_KEY = "__owner__";
