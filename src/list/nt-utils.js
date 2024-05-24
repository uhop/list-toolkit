'use strict';

// utilities for working with null-terminated lists

export const isNTList = (head, {nextName = 'next'} = {}) => {
  let current = head;
  do {
    const next = current[nextName];
    if (!next) return true;
    current = next;
  } while (current !== head);
  return false;
}

export const getNTListTail = (head, {nextName = 'next'} = {}) => {
  let current = head;
  do {
    const next = current[nextName];
    if (!next) return current;
    current = next;
  } while (current !== head);
  return null;
}

export const getNTListHead = (node, {prevName = 'prev'} = {}) => getTail(node, {nextName: prevName});

export const getNTListLength = (head, {nextName = 'next'} = {}) => {
  let current = head;
  let length = 1;
  do {
    const next = current[nextName];
    if (!next) return length;
    current = next;
    ++length;
  } while (current !== head);
  return length;
}

export const makeListFromNTList = (node, {nextName = 'next', prevName = 'prev'} = {}) => {
  const head = getNTListHead(node, {prevName}),
    tail = getNTListTail(node, {nextName});
  head[prevName] = tail;
  tail[nextName] = head;
  return {head, tail};
}

export const makeSListFromNTList = (head, {nextName = 'next'} = {}) => {
  const tail = getNTListTail(node, {nextName});
  tail[nextName] = head;
  return {head, tail};
}

export const makeNTListFromList = (head, {nextName = 'next', prevName = 'prev'} = {}) => {
  const tail = head[prevName];
  tail[nextName] = null;
  head[prevName] = null;
  return {head, tail};
}

export const makeNTListFromSListFast = (head, {nextName = 'next'} = {}) => {
  const tail = head;
  head = head[nextName];
  tail[nextName] = null;
  return {head, tail};
}

export const makeNTListFromSList = (head, {nextName = 'next'} = {}) => {
  const tail = head;
  for (;;) {
    const next = tail[nextName];
    if (next === head) break;
    tail = next;
  }
  tail[nextName] = null;
  return {head, tail};
}
