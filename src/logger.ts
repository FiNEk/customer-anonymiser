interface ILogger {
  log: (message: string, meta?: unknown) => void;
}

export class Logger implements ILogger {
  private readonly prefix?: string;

  public constructor(name?: string) {
    if (name) {
      this.prefix = `[${name}]:`;
    }
  }

  public log(message: string): void {
    const now = new Date().toISOString();
    console.log(now, this.prefix, message);
  }
}
