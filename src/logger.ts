export interface Logger {
  log: (message: string, meta?: unknown) => void;
}

export class ConsoleLogger implements Logger {
  private readonly prefix?: string;

  public constructor(name?: string) {
    if (name) {
      this.prefix = `[${name}]:`;
    } else {
      this.prefix = ":";
    }
  }

  public log(message: string): void {
    const now = new Date().toISOString();
    console.log(now, this.prefix, message);
  }
}
