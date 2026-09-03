/**
 * One tiny external store, reused by every domain store.
 *
 * The shape is dictated by a constraint in plan/01-architecture.md: an agent
 * can call a tool faster than React commits, so executors must read from the
 * store, never from render scope. Every store therefore exposes a plain
 * `read()` that works outside React, and a `use()` hook that is only a
 * subscription on top of the same value.
 *
 * `useSyncExternalStore` rather than `useState` because that is the hook that
 * is correct when a non-React caller can mutate between render and commit —
 * which, here, is the entire point.
 */

import { useSyncExternalStore } from 'react'
import { readJSON, writeJSON } from './persist'

export interface Store<T> {
  /** Current value. Safe to call from a tool executor. */
  read: () => T
  /** Replace the value and persist it. */
  set: (next: T | ((current: T) => T)) => T
  subscribe: (listener: () => void) => () => void
  /** React binding. Returns the same object identity `read()` would. */
  use: () => T
}

export function createStore<T>(key: string, seed: () => T): Store<T> {
  let value: T = readJSON<T>(key) ?? seed()
  // Persist the seed immediately so a reload is a load, not a reseed.
  writeJSON(key, value)

  const listeners = new Set<() => void>()

  const read = () => value

  const set = (next: T | ((current: T) => T)): T => {
    value = typeof next === 'function' ? (next as (current: T) => T)(value) : next
    writeJSON(key, value)
    listeners.forEach((fn) => fn())
    return value
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const use = () => useSyncExternalStore(subscribe, read, read)

  return { read, set, subscribe, use }
}
