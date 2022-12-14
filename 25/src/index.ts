class RequestInf {
  private apiName!: string;
  private responseTime!: number;
  private timestamp!: number;
  constructor(apiName: string, responseTime: number, timestamp: number) {
    this.apiName = apiName;
    this.responseTime = responseTime;
    this.timestamp = timestamp;
  }
  getApiName(): string {
    return this.apiName;
  }
  getResponseTime(): number {
    return this.responseTime;
  }
  getTimestamp() {
    return this.timestamp;
  }
}

abstract class MetricsStorage {
  protected requests: Map<string, Array<RequestInf>> = new Map();
  saveRequestInfo(requesInfo: RequestInf): void {
    if (!this.requests.get(requesInfo.getApiName())) {
      this.requests.set(requesInfo.getApiName(), []);
    }
    this.requests.get(requesInfo.getApiName())?.push(requesInfo);
  }

  abstract getApiRequestinfo(
    apiName: string,
    startTimeInMillis: number,
    endTimeInMillis: number
  ): RequestInf[];

  abstract getRequestinfo(
    startTimeInMillis: number,
    endTimeInMillis: number
  ): Map<string, Array<RequestInf>>;
}

class RedisStorage extends MetricsStorage {
  getApiRequestinfo(
    apiName: string,
    startTimeInMillis: number,
    endTimeInMillis: number
  ): RequestInf[] {
    const list = this.requests.get(apiName) || [];
    return list.filter(
      (item) =>
        startTimeInMillis < item.getTimestamp() &&
        item.getTimestamp() < endTimeInMillis
    );
  }

  getRequestinfo(
    startTimeInMillis: number,
    endTimeInMillis: number
  ): Map<string, Array<RequestInf>> {
    const resMap = new Map();
    for (const [apiName] of this.requests) {
      if (!resMap.has(apiName)) {
        resMap.set(
          apiName,
          this.getApiRequestinfo(apiName, startTimeInMillis, endTimeInMillis)
        );
      }
    }
    return resMap;
  }
}
// 负责数据存储
class MetricsCollector {
  private metricsStorage!: MetricsStorage;
  constructor(metricsStorage: MetricsStorage) {
    this.metricsStorage = metricsStorage;
  }
  recordRequest(requesInfo: RequestInf): void {
    this.metricsStorage.saveRequestInfo(requesInfo);
  }
}

class RequestStat {
  private maxRespTime!: number;
  private miniRespTime!: number;
  private avgRespTime!: number;
  private sumRespTime!: number;
  private count!: number;

  setMaxRespTime(maxRespTime: number) {
    this.maxRespTime = maxRespTime;
  }

  setMiniRespTime(miniRespTime: number) {
    this.miniRespTime = miniRespTime;
  }

  setAvgRespTime(avgRespTime: number) {
    this.avgRespTime = avgRespTime;
  }

  setSumRespTime(sumRespTime: number) {
    this.sumRespTime = sumRespTime;
  }

  setCount(count: number) {
    this.count = count;
  }
}
// 统计数据
class Aggregator {
  aggrate(
    reuestInfos: Map<string, RequestInf[]>,
    durationInMills: number
  ): Map<string, RequestStat> {
    const status = new Map();
    for (const [apiName, list] of reuestInfos) {
      const stat: RequestStat = this.doAggrate(list, durationInMills);
      status.set(apiName, stat);
    }
    return status;
  }
  doAggrate(requestInfos: RequestInf[], duraionTinMills: number): RequestStat {
    const times: number[] = [];
    for (const requesInfo of requestInfos) {
      const respTime = requesInfo.getResponseTime();
      times.push(respTime);
    }
    const requestStat = new RequestStat();
    requestStat.setMaxRespTime(this.max(times));
    requestStat.setMiniRespTime(this.min(times));
    requestStat.setAvgRespTime(this.avg(times));
    requestStat.setSumRespTime(this.sum(times));
    requestStat.setCount(times.length);
    return requestStat;
  }

  private max(times: number[]): number {
    let maxRespTime = 0;
    times.forEach((time) => {
      if (maxRespTime < time) {
        maxRespTime = time;
      }
    });
    return maxRespTime;
  }
  private min(times: number[]): number {
    let miniRespTime = 1000000000000;
    times.forEach((time) => {
      if (miniRespTime > time) {
        miniRespTime = time;
      }
    });
    return miniRespTime;
  }
  private sum(times: number[]): number {
    return times.reduce((prev, current) => prev + current, 0);
  }
  private avg(times: number[]): number {
    return this.sum(times) / times.length;
  }
}

interface StatViewer {
  output(status: Map<string, RequestStat>): void;
}

//通过终端输出信息

class ConsoleReporter implements StatViewer {
  constructor(
    private metricsStorage: MetricsStorage,
    private aggregator: Aggregator
  ) {}

  startRepeatReport(periodInSeconds: number, durationInSeconds: number) {
    const durationInMills = durationInSeconds * 1000;
    const endTimeInMillis = +new Date();
    const startTimeInMillis = endTimeInMillis - durationInMills;
    const reuestInfos = this.metricsStorage.getRequestinfo(
      startTimeInMillis,
      endTimeInMillis
    );
    const status = this.aggregator.aggrate(reuestInfos, durationInSeconds);
    this.output(status);
  }

  output(status: Map<string, RequestStat>) {
    console.log(status);
  }
}

// 邮件
class EmailReporter implements StatViewer {
  private DAY_HOURS_IN_SECONDS = 86400;
  constructor(
    private metricsStorage: MetricsStorage,
    private aggregator: Aggregator
  ) {}

  startDailyReport() {
    const durationInMills = this.DAY_HOURS_IN_SECONDS * 1000;
    const endTimeInMillis = +new Date();
    const startTimeInMillis = endTimeInMillis - durationInMills;
    const reuestInfos = this.metricsStorage.getRequestinfo(
      startTimeInMillis,
      endTimeInMillis
    );
    const status = this.aggregator.aggrate(reuestInfos, durationInMills);
    this.output(status);
  }
  output(status: Map<string, RequestStat>) {
    console.log(status);
  }
}

class Demo {
  static main() {
    const storage = new RedisStorage();
    const aggregator = new Aggregator();
    const consoleReporter = new ConsoleReporter(storage, aggregator);
    consoleReporter.startRepeatReport(60, 60);

    const emailReporter = new EmailReporter(storage, aggregator);
    emailReporter.startDailyReport();

    const collector = new MetricsCollector(storage);

    collector.recordRequest(new RequestInf("register", 123, 10234));
    collector.recordRequest(new RequestInf("register", 223, 122312));
    collector.recordRequest(new RequestInf("register", 323, 12334));
    collector.recordRequest(new RequestInf("login", 11, 12312));
    collector.recordRequest(new RequestInf("login", 112, 12312));
  }
}
