// @ts-self-types="./timer-wheel.d.ts"

import List from './list.js';
import {pop, splice} from './list/basics.js';

const toPow2 = n => {
  let c = 4;
  while (c < n) c <<= 1;
  return c;
};

// hashed timing wheel (Varghese & Lauck); logical time — the caller drives the clock
export class TimerWheel {
  constructor(options) {
    const slots = toPow2(options?.slots || 256);
    this.slots = new Array(slots);
    for (let i = 0; i < slots; ++i) this.slots[i] = new List();
    this.position = 0;
    this.currentTick = 0;
    this.size = 0;
  }
  get isEmpty() {
    return !this.size;
  }
  place(entry, delay) {
    delay = delay > 1 ? Math.floor(delay) : 1;
    entry.rounds = ((delay - 1) / this.slots.length) | 0;
    entry.slot = (this.position + delay) & (this.slots.length - 1);
    const slot = this.slots[entry.slot];
    if (!entry.next) entry.next = entry.prev = entry;
    splice(slot, slot.prev, entry);
    ++this.size;
    return entry;
  }
  schedule(value, delay) {
    return this.place({value, rounds: 0, slot: -1}, delay);
  }
  isScheduled(entry) {
    return !!entry && entry.slot >= 0;
  }
  cancel(entry) {
    if (!entry || entry.slot < 0) return false;
    pop(this.slots[entry.slot], entry);
    entry.slot = -1;
    --this.size;
    return true;
  }
  reschedule(entry, delay) {
    if (entry.slot >= 0) {
      pop(this.slots[entry.slot], entry);
      --this.size;
    }
    return this.place(entry, delay);
  }
  remainingTicks(entry) {
    if (!entry || entry.slot < 0) return undefined;
    const mask = this.slots.length - 1;
    return entry.rounds * this.slots.length + (((entry.slot - this.position - 1) & mask) + 1);
  }
  tick() {
    this.position = (this.position + 1) & (this.slots.length - 1);
    ++this.currentTick;
    const slot = this.slots[this.position],
      due = [];
    for (let node = slot.front, next; node !== slot; node = next) {
      next = node.next;
      if (node.rounds) --node.rounds;
      else {
        pop(slot, node);
        node.slot = -1;
        --this.size;
        due.push(node.value);
      }
    }
    return due;
  }
  advance(ticks) {
    const due = [];
    for (let i = Math.floor(ticks); i > 0; --i) {
      for (const value of this.tick()) due.push(value);
    }
    return due;
  }
  clear() {
    for (const slot of this.slots) {
      for (let node = slot.front, next; node !== slot; node = next) {
        next = node.next;
        node.slot = -1;
        node.next = node.prev = node; // detach so the handle can be rescheduled
      }
      slot.clear();
    }
    this.size = 0;
    return this;
  }
  [Symbol.iterator]() {
    let slotIndex = 0,
      node = this.slots[0].front;
    return {
      next: () => {
        while (node === this.slots[slotIndex]) {
          if (++slotIndex >= this.slots.length) return {done: true};
          node = this.slots[slotIndex].front;
        }
        const value = node.value;
        node = node.next;
        return {value};
      }
    };
  }
}

export default TimerWheel;
