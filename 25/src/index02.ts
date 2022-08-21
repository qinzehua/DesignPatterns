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
  static aggrate(
    requestInfos: RequestInf[],
    duraionTinMills: number
  ): RequestStat {
    let maxRespTime = 0;
    let miniRespTime = 1000000000000;
    let avgRespTime = 0;
    let sumRespTime = 0;
    let count = 0;

    for (const requesInfo of requestInfos) {
      count++;
      const respTime = requesInfo.getResponseTime();
      if (maxRespTime < respTime) {
        maxRespTime = respTime;
      }

      if (miniRespTime > respTime) {
        miniRespTime = respTime;
      }

      sumRespTime += respTime;
    }

    if (count !== 0) {
      avgRespTime = sumRespTime / count;
    }

    const requestStat = new RequestStat();
    requestStat.setMaxRespTime(maxRespTime);
    requestStat.setMiniRespTime(miniRespTime);
    requestStat.setAvgRespTime(avgRespTime);
    requestStat.setSumRespTime(sumRespTime);
    requestStat.setCount(count);
    return requestStat;
  }
}

//通过终端输出信息

class ConsoleReporter {
  private metricsStorage!: MetricsStorage;
  constructor(metricsStorage: MetricsStorage) {
    this.metricsStorage = metricsStorage;
  }

  startRepeatReport(periodInSeconds: number, durationInSeconds: number) {
    const durationInMills = durationInSeconds * 1000;
    const endTimeInMillis = +new Date();
    const startTimeInMillis = endTimeInMillis - durationInMills;
    const reuestInfos = this.metricsStorage.getRequestinfo(
      startTimeInMillis,
      endTimeInMillis
    );

    const status = new Map();
    for (const [apiName, list] of reuestInfos) {
      const stat: RequestStat = Aggregator.aggrate(list, durationInMills);
      status.set(apiName, stat);
    }

    console.log(status);
  }
}

// 邮件
class EmailReporter {
  private DAY_HOURS_IN_SECONDS = 86400;
  private metricsStorage!: MetricsStorage;
  constructor(metricsStorage: MetricsStorage) {
    this.metricsStorage = metricsStorage;
  }

  startDailyReport() {
    const durationInMills = this.DAY_HOURS_IN_SECONDS * 1000;
    const endTimeInMillis = +new Date();
    const startTimeInMillis = endTimeInMillis - durationInMills;
    const reuestInfos = this.metricsStorage.getRequestinfo(
      startTimeInMillis,
      endTimeInMillis
    );

    const status = new Map();
    for (const [apiName, list] of reuestInfos) {
      const stat: RequestStat = Aggregator.aggrate(list, durationInMills);
      status.set(apiName, stat);
    }

    console.log(status);
  }
}

class Demo {
  static main() {
    const storage = new RedisStorage();
    const consoleReporter = new ConsoleReporter(storage);
    consoleReporter.startRepeatReport(60, 60);

    const emailReporter = new EmailReporter(storage);
    emailReporter.startDailyReport();

    const collector = new MetricsCollector(storage);

    collector.recordRequest(new RequestInf("register", 123, 10234));
    collector.recordRequest(new RequestInf("register", 223, 122312));
    collector.recordRequest(new RequestInf("register", 323, 12334));
    collector.recordRequest(new RequestInf("login", 11, 12312));
    collector.recordRequest(new RequestInf("login", 112, 12312));
  }
}

export default {};
