import fs from "fs";
import path from "path";

abstract class FileSystemNode {
  constructor(private path: string) {}
  abstract countNumOfFiles(): number;
  abstract countSizeOfFiles(): number;
  getPath(): string {
    return this.path;
  }
}

class File extends FileSystemNode {
  constructor(path: string) {
    super(path);
  }

  countNumOfFiles(): number {
    return 1;
  }

  countSizeOfFiles(): number {
    return 10;
  }
}

class Folder extends FileSystemNode {
  private list: FileSystemNode[] = [];
  constructor(path: string) {
    super(path);
  }

  countNumOfFiles(): number {
    let count = 0;
    for (const node of this.list) {
      count += node.countNumOfFiles();
    }
    return count;
  }

  countSizeOfFiles(): number {
    return 10;
  }

  addSubNode(fileDir: FileSystemNode) {
    this.list.push(fileDir);
  }

  readFolder() {
    const subs = fs.readdirSync(this.getPath());
    for (const file of subs) {
      const nodePath = path.join(this.getPath(), file);
      if (fs.statSync(nodePath).isFile()) {
        this.addSubNode(new File(nodePath));
      } else {
        const node = new Folder(path.join(this.getPath(), file));
        this.addSubNode(node);
        node.readFolder();
      }
    }
  }

  removeSubNode(fileDir: FileSystemNode) {}
}

const dirSystem = new Folder(path.join(process.cwd(), "src"));
dirSystem.readFolder();
console.log(dirSystem.countNumOfFiles());
