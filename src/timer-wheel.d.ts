/** Options for configuring a timer wheel. */
export interface TimerWheelOptions {
  /** Number of wheel slots (default 256; rounded up to a power of two). More slots = fewer multi-round timers per revolution. */
  slots?: number;
}

/**
 * The handle returned by `schedule()`. `value` is the scheduled payload; the other
 * properties (`slot`, `rounds`, plus `next`/`prev` links) are wheel bookkeeping —
 * treat them as owned by the wheel.
 */
export interface TimerEntry<V = unknown> {
  /** The scheduled payload. */
  value: V;
  /** Remaining full revolutions before the entry is due. */
  rounds: number;
  /** Slot index, or `-1` when not scheduled (fired or cancelled). */
  slot: number;
}

/**
 * Hashed timing wheel (Varghese & Lauck): O(1) `schedule`, `cancel`, and
 * `reschedule`, with O(1) amortized cost per timer per `tick`. The wheel keeps
 * **logical time** — the caller drives the clock by calling `tick()`/`advance()`
 * from its own time source (an interval, a game loop, a simulation), which keeps
 * the structure runtime-agnostic and fully testable.
 *
 * Compared to a heap-based scheduler (`MinHeap`/`IndexedHeap`): the wheel wins on
 * O(1) everything and bulk expiry, but quantizes delays to whole ticks and does
 * work per tick even when idle; a heap has exact arbitrary priorities and no tick
 * driving, at O(log n) per operation.
 */
export class TimerWheel<V = unknown> {
  /** Per-slot lists of pending entries. */
  slots: object[];
  /** Current slot position of the wheel. */
  position: number;
  /** Number of ticks processed since construction. */
  currentTick: number;
  /** Number of pending timers. */
  size: number;

  /** @param options - Wheel geometry. */
  constructor(options?: TimerWheelOptions);

  /** Whether the wheel has no pending timers. */
  get isEmpty(): boolean;

  /**
   * Schedule a payload after `delay` ticks (clamped to ≥ 1 — the soonest a timer
   * can fire is the next tick). O(1).
   * @param value - Payload to schedule.
   * @param delay - Ticks until due.
   * @returns The timer handle — keep it for `cancel()`/`reschedule()`.
   */
  schedule(value: V, delay: number): TimerEntry<V>;

  /**
   * Check if a handle is currently scheduled on this wheel. O(1).
   * @param entry - Timer handle.
   * @returns `true` when pending.
   */
  isScheduled(entry: TimerEntry<V>): boolean;

  /**
   * Cancel a pending timer. O(1).
   * @param entry - Timer handle.
   * @returns `true` if it was pending and got cancelled, `false` otherwise.
   */
  cancel(entry: TimerEntry<V>): boolean;

  /**
   * Move a timer to a new delay (cancelling its pending occurrence if any); also
   * revives an already-fired or cancelled handle. O(1).
   * @param entry - Timer handle.
   * @param delay - Ticks until due (clamped to ≥ 1).
   * @returns The same handle.
   */
  reschedule(entry: TimerEntry<V>, delay: number): TimerEntry<V>;

  /**
   * Ticks left until a pending handle fires.
   * @param entry - Timer handle.
   * @returns The remaining tick count, or `undefined` when not scheduled.
   */
  remainingTicks(entry: TimerEntry<V>): number | undefined;

  /**
   * Advance the wheel by one tick and collect due payloads. Same-tick timers fire
   * in scheduling order.
   * @returns Payloads that came due on this tick.
   */
  tick(): V[];

  /**
   * Advance the wheel by several ticks.
   * @param ticks - Number of ticks to process.
   * @returns Payloads that came due, in firing order.
   */
  advance(ticks: number): V[];

  /**
   * Cancel everything. Outstanding handles become unscheduled.
   * @returns `this` for chaining.
   */
  clear(): this;

  /** Iterate over pending payloads in wheel-slot order (not time order). */
  [Symbol.iterator](): IterableIterator<V>;
}

export default TimerWheel;
