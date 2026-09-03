/**
 * Hash router and selection state, in one reducer.
 *
 * Six routes and no library, per the scope reductions in
 * plan/01-architecture.md. Selection (`selectedTrendId`, `selectedProductId`,
 * `openBriefId`) lives in the same reducer as the route because the tool guards
 * read both together — `get_brief_context` and `save_brief` are conditioned on
 * *selection*, not route, so they survive navigating between Trends and
 * Products while composing. Splitting them into two stores would mean two
 * subscriptions that can disagree for one frame, and a tool surface that
 * flickers is a tool surface an agent cannot trust.
 *
 * The reducer is module-level rather than a `useReducer` inside a component for
 * the reason given in plan/01-architecture.md: executors must read current
 * state without going through render scope, because an agent can call a tool
 * faster than React commits.
 */

import { useSyncExternalStore } from 'react'
import { isRoute } from '../types'
import type { Route } from '../types'

export interface AppState {
  route: Route
  selectedTrendId: string | null
  selectedProductId: string | null
  openBriefId: string | null
}

export type RouterAction =
  | { type: 'hash'; hash: string }
  | { type: 'navigate'; route: Route }
  | { type: 'selectTrend'; trendId: string | null }
  | { type: 'selectProduct'; productId: string | null }
  | { type: 'openBrief'; briefId: string | null }

const INITIAL_ROUTE: Route = 'dashboard'

/** `#/trends` → `trends`. Anything unrecognised lands on the dashboard. */
export function routeFromHash(hash: string): Route {
  const name = hash.replace(/^#\/?/, '').split(/[?/]/)[0]
  return isRoute(name) ? name : INITIAL_ROUTE
}

export function reduce(state: AppState, action: RouterAction): AppState {
  switch (action.type) {
    case 'hash': {
      const route = routeFromHash(action.hash)
      return route === state.route ? state : { ...state, route }
    }
    case 'navigate':
      return action.route === state.route ? state : { ...state, route: action.route }
    case 'selectTrend':
      return state.selectedTrendId === action.trendId ? state : { ...state, selectedTrendId: action.trendId }
    case 'selectProduct':
      return state.selectedProductId === action.productId ? state : { ...state, selectedProductId: action.productId }
    case 'openBrief':
      return state.openBriefId === action.briefId ? state : { ...state, openBriefId: action.briefId }
  }
}

let state: AppState = {
  route: routeFromHash(typeof location === 'undefined' ? '' : location.hash),
  selectedTrendId: null,
  selectedProductId: null,
  openBriefId: null,
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((fn) => fn())
}

/** Current route and selection. Safe to call from a tool executor. */
export function readAppState(): AppState {
  return state
}

export function dispatch(action: RouterAction): AppState {
  const next = reduce(state, action)
  if (next === state) return state
  state = next
  emit()
  return state
}

/**
 * Navigate, and keep the address bar as the single source of truth.
 *
 * Writing the hash fires `hashchange`, which dispatches again and is a no-op
 * because the reducer returns the same object for an unchanged route. Doing it
 * in this order means a hash typed by hand and a `navigate_to` call from an
 * agent take the identical path through the reducer.
 */
export function navigate(route: Route): Route {
  dispatch({ type: 'navigate', route })
  const hash = `#/${route}`
  if (typeof location !== 'undefined' && location.hash !== hash) {
    location.hash = hash
  }
  return route
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

let hashBound = false

/** Bind `hashchange` once. Called from the app root. */
export function bindHashListener(): void {
  if (hashBound || typeof window === 'undefined') return
  hashBound = true
  window.addEventListener('hashchange', () => {
    dispatch({ type: 'hash', hash: location.hash })
  })
  // A first visit with no hash should be an honest `#/dashboard`, so a reload
  // and a shared link land in the same place.
  if (!location.hash) location.hash = `#/${state.route}`
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, readAppState, readAppState)
}
