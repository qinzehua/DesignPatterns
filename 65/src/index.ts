interface Iterators<T> {
  next(): void;
  hasNext(): boolean;
  currentItem(): T;
}

class ArrayIterator<T> implements Iterators<T> {
  private cursor!: number;
  private arrayLlist!: T[];
  constructor(arrayLlist: T[]) {
    this.cursor = 0;
    this.arrayLlist = arrayLlist;
  }

  next(): void {
    this.cursor++;
  }

  hasNext(): boolean {
    return this.cursor >= this.arrayLlist.length;
  }
  currentItem(): T {
    if(this.cursor >= this.arrayLlist.length) {
      throw new Error('遍历结束')
    }
    return this.arrayLlist[this.cursor]!;
  }
}

export default {};
