interface Iterator<E> {
  hasNext(): boolean;
  next(): E;
}

class ArrayList<E> {
  private list: E[] = [];
  private addTimestamps: number[] = [];
  private delTimestamps: number[] = [];

  private total: number = 0;
  private actualTotal = 0;

  add(item: E) {
    this.addTimestamps.push(+new Date());
    this.delTimestamps.push(Infinity);
    this.list.push(item);

    this.total++;
    this.actualTotal++;
  }

  remove(obj: E) {
    for (let i = 0; i < this.list.length; i++) {
      if (obj === this.list[i]) {
        this.delTimestamps[i] = +new Date();
        this.actualTotal--;
        break;
      }
    }
  }

  iterator(): Iterator<E> {
    return new SnapshotArrayIterator(this);
  }

  get(index: number): E {
    if (index >= this.list.length || index < 0) {
      throw new Error("Index");
    } else {
      return this.list[index]!;
    }
  }

  actualSize(): number {
    return this.actualTotal;
  }
  totalSize(): number {
    return this.total;
  }

  getAddTimestamp(i: number) {
    if (i >= this.total) {
      throw new Error("Index");
    }
    return this.addTimestamps[i];
  }
  getDelTimestamp(i: number) {
    if (i >= this.total) {
      throw new Error("Index");
    }
    return this.delTimestamps[i];
  }
}

class SnapshotArrayIterator<E> implements Iterator<E> {
  private list!: ArrayList<E>;
  private cursor: number;
  private leftCount: number;
  private snapshotTimestamp: number;
  constructor(list: ArrayList<E>) {
    this.list = list;
    this.cursor = 0;
    this.leftCount = list.actualSize();
    this.snapshotTimestamp = +new Date();
    this.moveCursor();
  }

  hasNext() {
    return this.leftCount >= 0;
  }

  next(): E {
    const current = this.list.get(this.cursor);
    this.justNext();
    this.moveCursor();
    return current;
  }

  moveCursor() {
    while (this.cursor < this.list.totalSize()) {
      const addTimestamp = this.list.getAddTimestamp(this.cursor)!;
      const delTimestamps = this.list.getDelTimestamp(this.cursor)!;
      if (
        this.snapshotTimestamp > addTimestamp &&
        this.snapshotTimestamp < delTimestamps
      ) {
        break;
      }
      this.cursor++;
    }
  }

  justNext() {
    this.leftCount--;
    this.cursor++;
  }
}

const list = new ArrayList<number>();
list.add(111);
list.add(222);
list.add(333);

setTimeout(() => {
  const iterator = list.iterator();
  setTimeout(() => {
    list.remove(222);
    console.log(iterator.next());
    console.log(iterator.next());
    console.log(iterator.next());
  });
}, 100);

export default {};
