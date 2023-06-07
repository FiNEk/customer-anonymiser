import { Collection, MongoClient } from "mongodb";
import { Logger } from "../logger";
import { Customer } from "../models/customer.model";

export class MongoService {
  public readonly client: MongoClient;
  private readonly dbName: string;
  private static instance: MongoService;
  private readonly logger: Logger;

  private constructor() {
    if (!process.env.DB_URI)
      throw new Error("Enviroment variable DB_URI is not defined");

    this.client = new MongoClient(process.env.DB_URI);
    this.dbName = "test";
    this.logger = new Logger("MongoDB");
  }

  public static getInstance(): MongoService {
    if (!MongoService.instance) {
      MongoService.instance = new MongoService();
    }
    return MongoService.instance;
  }

  public async connect(): Promise<void> {
    this.logger.log(`Connecting to ${process.env.DB_URI}...`);
    await this.client.connect();
    this.logger.log("Connected!");
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }

  public get customers(): Collection<Customer> {
    return this.client.db(this.dbName).collection("customers");
  }

  public get customersAnonymized(): Collection<Customer> {
    return this.client.db(this.dbName).collection("customers_anonymized");
  }

  public get anonymizerCursor(): Collection<{ resumeToken: unknown }> {
    return this.client.db(this.dbName).collection("anonymizer_cursor");
  }
}
