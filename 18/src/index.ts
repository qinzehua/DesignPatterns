interface Updater {
  update(): void;
}

interface Viewer {
  outputInPlainText(): string;
  output(): Map<number, number>;
}

class RedisConfig implements Updater, Viewer {
  private address!: string;
  public getAddress(): string {
    return this.address;
  }

  public update(): void {}
  public outputInPlainText(): string {
    return "hello";
  }
  public output(): Map<number, number> {
    return new Map([[1, 2]]);
  }
}

class KafkaConfig implements Updater {
  private address!: string;
  public getAddress(): string {
    return this.address;
  }
  public update(): void {}
}

class MysqlConfig implements Viewer {
  private address!: string;
  public getAddress(): string {
    return this.address;
  }
  public outputInPlainText(): string {
    return "hello";
  }
  public output(): Map<number, number> {
    return new Map([[1, 2]]);
  }
}

class Scheduler {
  constructor(private updater: Updater) {}
  run(): void {
    this.updater.update();
  }
}

class SimpleHttpServer {
  private views: Map<string, Viewer> = new Map();
  public addViewers(key: string, viewer: Viewer) {
    if (!this.views.has(key)) {
      this.views.set(key, viewer);
    }
  }

  run() {}
}

class Application {
  public static redisConfig: RedisConfig = new RedisConfig();
  public static kafkaConfig: KafkaConfig = new KafkaConfig();
  public static mysqlConfig: MysqlConfig = new MysqlConfig();
  constructor() {}

  static main(): void {
    const s1 = new Scheduler(Application.redisConfig);
    s1.run();
    const s2 = new Scheduler(Application.kafkaConfig);
    s2.run();

    const h1 = new SimpleHttpServer();
    h1.addViewers("k1", Application.mysqlConfig);
    h1.addViewers("k2", Application.redisConfig);
    h1.run();
  }
}
