import test from 'tape-six';
import {
  capitalize,
  toCamelCase,
  fromCamelCase,
  toPascalCase,
  fromPascalCase,
  toAllCapsSnakeCase,
  toSnakeCase,
  fromSnakeCase,
  toKebabCase,
  fromKebabCase,
  defaultDescriptor,
  fromGetter,
  fromSetter,
  fromAccessors,
  addAlias,
  addAliases,
  mapIterator,
  copyOptions
} from 'list-toolkit/meta-utils.js';

test('utils: copyOptions()', t => {
  t.equal(typeof copyOptions, 'function');

  t.deepEqual(copyOptions({a: 1}, {b: 2, c: 3}), {a: 1, b: 2, c: 3});
  t.deepEqual(copyOptions({a: 1}, {b: 2, c: 3}, {c: 5, d: 4}), {a: 1, b: 2, c: 5});
  t.deepEqual(copyOptions({a: 1}, {b: 2, c: 3}, null, 1, 'z'), {a: 1, b: 2, c: 3});
  t.deepEqual(copyOptions(null, {b: 2, c: 3}, null, 1, 'z'), {b: 2, c: 3});
});

test('utils: case conversions', t => {
  t.equal(capitalize('hello'), 'Hello');
  t.equal(capitalize(''), '');

  t.equal(toCamelCase(['foo', 'bar', 'baz']), 'fooBarBaz');
  t.deepEqual(fromCamelCase('fooBarBaz'), ['foo', 'Bar', 'Baz']);

  t.equal(toPascalCase(['foo', 'bar']), 'FooBar');
  t.deepEqual(fromPascalCase('FooBar'), ['Foo', 'Bar']);

  t.equal(toAllCapsSnakeCase(['foo', 'bar']), 'FOO_BAR');
  t.equal(toSnakeCase(['Foo', 'Bar']), 'foo_bar');
  t.deepEqual(fromSnakeCase('foo_bar'), ['foo', 'bar']);

  t.equal(toKebabCase(['Foo', 'Bar']), 'foo-bar');
  t.deepEqual(fromKebabCase('foo-bar'), ['foo', 'bar']);
});

test('utils: descriptor factories', t => {
  const getter = () => 42,
    setter = v => v;

  t.deepEqual(defaultDescriptor, {configurable: true, enumerable: false});

  // omitted descriptor arg: the TDZ regression path (2026-07-18)
  t.deepEqual(fromGetter(getter), {...defaultDescriptor, get: getter});
  t.deepEqual(fromSetter(setter), {...defaultDescriptor, set: setter});
  t.deepEqual(fromAccessors(getter, setter), {...defaultDescriptor, get: getter, set: setter});

  t.deepEqual(fromGetter(getter, {enumerable: true}), {enumerable: true, get: getter});
  t.deepEqual(fromSetter(setter, {configurable: false}), {configurable: false, set: setter});
  t.deepEqual(fromAccessors(getter, setter, {}), {get: getter, set: setter});

  t.deepEqual(fromGetter(null), {...defaultDescriptor});
  t.deepEqual(fromSetter(null), {...defaultDescriptor});
  t.deepEqual(fromAccessors(getter, null), {...defaultDescriptor, get: getter});
  t.deepEqual(fromAccessors(null, setter), {...defaultDescriptor, set: setter});
  t.deepEqual(fromAccessors(null, null), {...defaultDescriptor});

  const obj = Object.defineProperty(
    {},
    'answer',
    fromGetter(() => 42)
  );
  t.equal(obj.answer, 42);
});

test('utils: addAlias()', t => {
  const obj = {
    foo() {
      return 42;
    }
  };
  addAlias(obj, 'foo', 'bar');
  t.equal(obj.bar(), 42);

  addAlias(obj, 'foo', 'a, b');
  t.equal(obj.a(), 42);
  t.equal(obj.b(), 42);
});

test('utils: addAliases()', t => {
  const obj = {
    x() {
      return 1;
    },
    y() {
      return 2;
    }
  };
  addAliases(obj, {x: 'a', y: 'b, c'});
  t.equal(obj.a(), 1);
  t.equal(obj.b(), 2);
  t.equal(obj.c(), 2);
});

test('utils: mapIterator()', t => {
  const source = [10, 20, 30];
  const mapped = mapIterator(source, (v, i) => v + i);
  t.deepEqual(Array.from(mapped), [10, 21, 32]);

  const empty = mapIterator([], v => v * 2);
  t.deepEqual(Array.from(empty), []);
});
