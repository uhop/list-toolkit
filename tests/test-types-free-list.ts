import test from 'tape-six';
import FreeList from 'list-toolkit/free-list.js';

interface Node {
  value: number | null;
  next?: Node | null;
  prev?: Node | null;
}

test('FreeList<T>: constructor and basic property types', t => {
  const pool = new FreeList<Node>({
    create: () => ({value: null}),
    reset: node => {
      node.value = null;
    },
    capacity: 100,
    nextName: 'next',
    prevName: 'prev'
  });
  const _size: number = pool.size;
  const _capacity: number = pool.capacity;
  const _isEmpty: boolean = pool.isEmpty;
  const _isFull: boolean = pool.isFull;
  t.pass('compiles');
});

test('FreeList<T>: operation types', t => {
  const pool = new FreeList<Node>();
  const _node: Node | undefined = pool.acquire();
  const _self: FreeList<Node> = pool.release({value: 1}).preallocate(10).clear();
  const _iter: IterableIterator<Node> = pool[Symbol.iterator]();
  t.pass('compiles');
});
