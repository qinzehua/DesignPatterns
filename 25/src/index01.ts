class Metrics1 {
  private responseTime: Map<string, Array<number>> = new Map();
  private timestamps: Map<string, Array<number>> = new Map();

  recordResponseTime(apiName: string, responseTime: number): void {
    if (this.responseTime.get(apiName)) {
      this.responseTime.get(apiName)?.push(responseTime);
    } else {
      this.responseTime.set(apiName, []);
    }
  }

  recordTimestamp(apiName: string, timestamp: number): void {
    if (this.timestamps.get(apiName)) {
      this.timestamps.get(apiName)?.push(timestamp);
    } else {
      this.timestamps.set(apiName, []);
    }
  }

  startRepeatReport() {
    const status: Map<string, Map<string, number>> = new Map();
    for (const [apiName, times] of this.responseTime.entries()) {
      if (!status.get(apiName)) {
        status.set(apiName, new Map());
      }

      status.get(apiName)?.set("max", this.max(times));
      status.get(apiName)?.set("avg", this.avg(times));
    }

    for (const [apiName, times] of this.timestamps.entries()) {
      if (!status.get(apiName)) {
        status.set(apiName, new Map());
      }

      status.get(apiName)?.set("count", times.length);
    }
  }

  max(times: number[]): number {
    return times.reduce((prev, curr) => (curr > prev ? curr : prev), 0);
  }
  avg(times: number[]): number {
    return 2;
  }
}
