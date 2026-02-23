'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Ptr = void 0;
var _nodes = require("./nodes.js");
var _basics = require("./basics.js");
class Ptr extends _nodes.PtrBase {
  constructor(list, node) {
    super(list, node, _nodes.HeadNode);
  }
  get isHead() {
    return this.node === this.list;
  }
  clone() {
    return new Ptr(this);
  }
  removeCurrent() {
    if (this.node === this.list) return null;
    const node = this.node;
    this.node = node[this.list.nextName];
    return (0, _basics.pop)(this.list, node).extracted;
  }
  addBefore(value) {
    const node = this.list.adoptValue(value);
    (0, _basics.splice)(this.list, this.node[this.list.prevName], node);
    return this.list.makePtr(node);
  }
  addNodeBefore(node) {
    node = this.list.adoptNode(node);
    (0, _basics.splice)(this.list, this.node[this.list.prevName], node);
    return this.list.makePtr(node);
  }
  addAfter(value) {
    const node = this.list.adoptValue(value);
    (0, _basics.splice)(this.list, this.node, node);
    return this.list.makePtr(node);
  }
  addNodeAfter(node) {
    node = this.list.adoptNode(node);
    (0, _basics.splice)(this.list, this.node, node);
    return this.list.makePtr(node);
  }
  insertBefore(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return null;
    const head = (0, _basics.pop)(list, list).rest;
    (0, _basics.splice)(this.list, this.node[this.list.prevName], head);
    return this.list.makePtr(head);
  }
  insertAfter(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return null;
    const head = (0, _basics.pop)(list, list).rest;
    (0, _basics.splice)(this.list, this.node, head);
    return this.list.makePtr(head);
  }
}
exports.Ptr = Ptr;
var _default = exports.default = Ptr;