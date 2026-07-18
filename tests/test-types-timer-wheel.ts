import test from 'tape-six';
import TimerWheel, {type TimerEntry} from 'list-toolkit/timer-wheel.js';

test('TimerWheel<V>: constructor and basic property types', t => {
  const wheel = new TimerWheel<string>({slots: 64});
  const _size: number = wheel.size;
  const _tickCount: number = wheel.currentTick;
  const _position: number = wheel.position;
  const _isEmpty: boolean = wheel.isEmpty;
  t.pass('compiles');
});

test('TimerWheel<V>: scheduling types', t => {
  const wheel = new TimerWheel<string>();
  const entry: TimerEntry<string> = wheel.schedule('task', 10);
  const _value: string = entry.value;
  const _isScheduled: boolean = wheel.isScheduled(entry);
  const _cancelled: boolean = wheel.cancel(entry);
  const _again: TimerEntry<string> = wheel.reschedule(entry, 5);
  const _remaining: number | undefined = wheel.remainingTicks(entry);
  const _due: string[] = wheel.tick();
  const _batch: string[] = wheel.advance(10);
  const _self: TimerWheel<string> = wheel.clear();
  const _iter: IterableIterator<string> = wheel[Symbol.iterator]();
  t.pass('compiles');
});
