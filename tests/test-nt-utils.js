'use strict';

import test from 'tape-six';
import {
  isNTList,
  getNTListHead,
  getNTListTail,
  getNTListLength,
  makeListFromNTList,
  makeSListFromNTList,
  makeNTListFromList,
  makeNTListFromSListFast,
  makeNTListFromSList
} from 'list-toolkit/nt-utils.js';

test('isNTList()', t => {
  t.equal(typeof isNTList, 'function');
  t.ok(isNTList(null));
  t.notOk(isNTList({}));

  const circular = {};
  circular.n = circular;

  t.notOk(isNTList(circular, {nextName: 'n'}));

  const node = {nx: null};
  t.ok(isNTList(node, {nextName: 'nx'}));

  const node2 = {nx: null};
  node.nx = node2;
  t.ok(isNTList(node, {nextName: 'nx'}));
});

test('getNTListHead(), getNTListTail(), getNTListLength()', t => {
  t.equal(typeof getNTListHead, 'function');
  t.equal(typeof getNTListTail, 'function');
  t.equal(typeof getNTListLength, 'function');

  t.equal(getNTListHead(null), null);
  t.equal(getNTListTail(null), null);
  t.equal(getNTListLength(null), 0);

  const node = {},
    nodeFirst = {},
    nodeLast = {};

  nodeFirst.pr = null;
  nodeFirst.nx = node;

  node.pr = nodeFirst;
  node.nx = nodeLast;

  nodeLast.nx = null;
  nodeLast.pr = node;

  const options = {nextName: 'nx', prevName: 'pr'};

  t.ok(getNTListHead(nodeFirst, options) === nodeFirst);
  t.ok(getNTListHead(node, options) === nodeFirst);
  t.ok(getNTListHead(nodeLast, options) === nodeFirst);

  t.ok(getNTListTail(nodeFirst, options) === nodeLast);
  t.ok(getNTListTail(node, options) === nodeLast);
  t.ok(getNTListTail(nodeLast, options) === nodeLast);

  t.ok(getNTListLength(nodeFirst, options) === 3);
  t.ok(getNTListLength(node, options) === 2);
  t.ok(getNTListLength(nodeLast, options) === 1);
});

test('makeListFromNTList(), makeNTListFromList()', t => {
  t.equal(typeof makeListFromNTList, 'function');
  t.equal(typeof makeNTListFromList, 'function');

  t.equal(makeListFromNTList(null), null);
  t.equal(makeNTListFromList(null), null);

  const node = {v: 2},
    nodeFirst = {v: 1},
    nodeLast = {v: 3};

  nodeFirst.pr = null;
  nodeFirst.nx = node;

  node.pr = nodeFirst;
  node.nx = nodeLast;

  nodeLast.nx = null;
  nodeLast.pr = node;

  const options = {nextName: 'nx', prevName: 'pr'};

  const isGoodList = ({head, tail}) => head === nodeFirst && tail === nodeLast && head.pr === tail && tail.nx === head;
  const isGoodNTList = ({head, tail}) => isNTList(head, options) && head === nodeFirst && tail === nodeLast;

  t.ok(isGoodList(makeListFromNTList(nodeFirst, options)));
  t.ok(isGoodNTList(makeNTListFromList(nodeFirst, options)));

  t.ok(isGoodList(makeListFromNTList(node, options)));
  t.ok(isGoodNTList(makeNTListFromList(nodeFirst, options)));

  t.ok(isGoodList(makeListFromNTList(nodeLast, options)));
  t.ok(isGoodNTList(makeNTListFromList(nodeFirst, options)));
});

test('makeSListFromNTList(), makeNTListFromSList(), makeNTListFromSListFast()', t => {
  t.equal(typeof makeSListFromNTList, 'function');
  t.equal(typeof makeNTListFromSList, 'function');
  t.equal(typeof makeNTListFromSListFast, 'function');

  t.equal(makeSListFromNTList(null), null);
  t.equal(makeNTListFromSList(null), null);
  t.equal(makeNTListFromSListFast(null), null);

  const node = {v: 2},
    nodeFirst = {v: 1},
    nodeLast = {v: 3};

  nodeFirst.nx = node;
  node.nx = nodeLast;
  nodeLast.nx = null;

  const options = {nextName: 'nx'};

  const isGoodSList = ({head, tail}) => head === nodeFirst && tail === nodeLast && tail.nx === head;
  const isGoodNTList = ({head, tail}) => isNTList(head, options) && head === nodeFirst && tail === nodeLast;

  t.ok(isGoodSList(makeSListFromNTList(nodeFirst, options)));
  t.ok(isGoodNTList(makeNTListFromSList(nodeFirst, options)));

  t.ok(isGoodSList(makeSListFromNTList(nodeFirst, options)));

  const nt = makeNTListFromSListFast(nodeFirst, options);
  t.ok(nt.head === node);
  t.ok(nt.tail === nodeFirst);
  t.ok(node.nx === nodeLast);
  t.ok(nodeLast.nx === nodeFirst);
  t.ok(nodeFirst.nx === null);
});
