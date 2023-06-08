import crypto from "crypto";
import {
  ChangeStream,
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
  ObjectId,
} from "mongodb";
import { ConsoleLogger, Logger } from "../logger";
import { Customer } from "../models/customer.model";
import { CustomersAnonymizedRepository } from "../repositories/customers-anonymized.repository";
import { MongoService } from "./mongo.service";

type UpsertChangeStream = ChangeStream<
  Customer,
  ChangeStreamInsertDocument<Customer> | ChangeStreamUpdateDocument<Customer>
>;

export class AnonymizerService {
  private static readonly FLUSH_TIMEOUT_MS = 1000; // 1 sec
  private static readonly CURSOR_ID = new ObjectId("000000000000000000000000");

  private readonly logger: Logger;
  private readonly mongoService: MongoService;
  private readonly repository: CustomersAnonymizedRepository;
  private buffer: Customer[] = [];
  private resumeToken?: unknown;

  public constructor() {
    this.mongoService = MongoService.getInstance();
    this.repository = new CustomersAnonymizedRepository();
    this.logger = new ConsoleLogger("Anonymiser");
  }

  public async fullReindex(): Promise<void> {
    this.logger.log("Starting full reindex...");
    const cursor = this.mongoService.customers.find();
    const count = await this.mongoService.customers.countDocuments();
    this.logger.log(`Will anonymise ${count} customers`);
    for await (const customer of cursor) {
      const anonymisedCustomer = this.anonymiseCustomer(customer);
      this.buffer.push(anonymisedCustomer);
      if (this.buffer.length >= 1000) {
        await this.flushBuffer();
      }
    }
    await this.flushBuffer();
    this.logger.log(`Full reindex finished, anonymised ${count} customers`);
  }

  public async start(): Promise<void> {
    await this.getResumeToken();
    const anonymiserStream = this.streamAnonymisedCustomers();

    setInterval(async () => {
      await this.flushBuffer();
    }, AnonymizerService.FLUSH_TIMEOUT_MS);

    for await (const customer of anonymiserStream) {
      this.buffer.push(customer);
      if (this.buffer.length >= 1000) {
        await this.flushBuffer();
      }
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.buffer.length > 0) {
      await this.repository.upsert(this.buffer);
      this.logger.log(`Anonymised ${this.buffer.length} customers`);
      this.buffer.length = 0;
      await this.updateResumeToken();
    }
  }

  private async *streamAnonymisedCustomers(): AsyncGenerator<Customer> {
    this.logger.log("Starting change stream...");
    const stream: UpsertChangeStream = this.mongoService.customers.watch(
      [{ $match: { operationType: { $in: ["insert", "update"] } } }],
      {
        fullDocument: "updateLookup",
        resumeAfter: this.resumeToken,
      }
    );

    this.logger.log("Waiting for changes...");
    for await (const change of stream) {
      if (change.fullDocument) {
        this.resumeToken = change._id;
        yield this.anonymiseCustomer(change.fullDocument);
      }
    }
  }

  private async updateResumeToken(): Promise<void> {
    if (this.resumeToken) {
      await this.mongoService.anonymizerCursor.updateOne(
        { _id: AnonymizerService.CURSOR_ID },
        { $set: this.resumeToken },
        { upsert: true }
      );
    }
  }

  private async getResumeToken(): Promise<void> {
    this.logger.log("Getting resume token...");
    const resumeToken = await this.mongoService.anonymizerCursor.findOne({
      _id: AnonymizerService.CURSOR_ID,
    });
    if (resumeToken) {
      this.resumeToken = resumeToken;
      this.logger.log("Resume token found");
      return;
    }
    this.logger.log("Resume token not found, will watch only for new changes");
  }

  private hashValue(value: string): string {
    return crypto.createHash("md5").update(value).digest("hex").substring(0, 8);
  }

  private anonymiseCustomer(customer: Customer): Customer {
    const emailSplit = customer.email.split("@");
    if (emailSplit.length === 2) {
      customer.email = `${this.hashValue(emailSplit[0])}@${emailSplit[1]}`;
    }

    customer.firstName = this.hashValue(customer.firstName);
    customer.lastName = this.hashValue(customer.lastName);
    customer.address.line1 = this.hashValue(customer.address.line1);
    customer.address.line2 = this.hashValue(customer.address.line2);
    customer.address.postcode = this.hashValue(customer.address.postcode);
    return customer;
  }
}
