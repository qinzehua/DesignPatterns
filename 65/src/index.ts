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
    return !!this.arrayLlist[this.cursor + 1];
  }
  currentItem(): T {
    return this.arrayLlist[this.cursor]!;
  }
}

export default {};
