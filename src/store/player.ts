/**
 * The drawer's clip player, as state rather than as a DOM reference.
 *
 * `play_clip` has to start the video the human is looking at, which means the
 * executor needs a way to reach a `<video>` element it cannot see. Handing the
 * tool a ref would couple an executor to a component's lifetime and break the
 * moment the drawer re-renders. So the tool writes an intent here and the
 * player component obeys it: one direction, and the human's click on the same
 * clip goes through the identical path.
 *
 * `playToken` exists because "play the clip that is already selected" has to be
 * a distinguishable event. Without it, a second `play_clip` for the same clip
 * changes nothing observable and the agent has, correctly, called a tool that
 * did nothing.
 *
 * Not persisted, and not in plan/02-data-model.md's key list on purpose: this
 * is transient view state and a reload should land on a stopped player.
 */

import { useSyncExternalStore } from 'react'

export interface PlayerState {
  /** The clip currently loaded into the drawer's player. */
  clipId: string | null
  /** Seconds to seek to on the next play request. */
  seekS: number
  /** Bumped on every play request, including a repeat of the current clip. */
  playToken: number
}

const INITIAL: PlayerState = { clipId: null, seekS: 0, playToken: 0 }

let state: PlayerState = INITIAL
const listeners = new Set<() => void>()

export function readPlayer(): PlayerState {
  return state
}

function commit(next: PlayerState): PlayerState {
  state = next
  listeners.forEach((fn) => fn())
  return state
}

/** Load a clip without starting it — the drawer opening, or a human picking a chip. */
export function selectClip(clipId: string | null): PlayerState {
  if (state.clipId === clipId) return state
  return commit({ clipId, seekS: 0, playToken: state.playToken })
}

/** Load a clip and start it. This is what `play_clip` calls. */
export function requestPlay(clipId: string, seekS: number): PlayerState {
  return commit({ clipId, seekS, playToken: state.playToken + 1 })
}

export function resetPlayer(): PlayerState {
  if (state === INITIAL) return state
  return commit(INITIAL)
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function usePlayer(): PlayerState {
  return useSyncExternalStore(subscribe, readPlayer, readPlayer)
}
