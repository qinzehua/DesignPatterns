import fs from "fs";
import path from "path";

class FileSystemNode {
  list: FileSystemNode[] = [];
  constructor(private path: string, private isFile: boolean) {}
  countNumOfFiles(): number {
    if (this.isFile) return 1;
    let count = 0;
    for (const node of this.list) {
      count += node.countNumOfFiles();
    }
    return count;
  }

  countSizeOfFiles(): number {
    return 1;
  }

  getPath(): string {
    return this.path;
  }

  addSubNode(fileDir: FileSystemNode): void {
    this.list.push(fileDir);
  }

  readFolder() {
    if (fs.statSync(this.path).isFile()) return;
    const subs = fs.readdirSync(this.path);
    subs.forEach((fileDir) => {
      const status = fs.statSync(path.join(this.path, fileDir));
      const node = new FileSystemNode(
        path.join(this.path, fileDir),
        status.isFile()
      );
      this.addSubNode(node);
      node.readFolder();
    });
  }
  public removeSubNode(fileDir: FileSystemNode): void {}
}

const dirSystem = new FileSystemNode(path.join(process.cwd(), "src"), false);
dirSystem.readFolder();
console.log(dirSystem.countNumOfFiles());
