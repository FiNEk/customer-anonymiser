import { faker } from "@faker-js/faker";
import { ObjectId } from "mongodb";
import { setTimeout } from "timers/promises";
import { ConsoleLogger, Logger } from "../logger";
import { Customer } from "../models/customer.model";
import { CustomersRepository } from "../repositories/customers.repository";
import { Utils } from "../utils";

export class GeneratorService {
  private static readonly INTERVAL_MS = 200;
  private readonly repository: CustomersRepository;
  private readonly logger: Logger;

  public constructor() {
    this.repository = new CustomersRepository();
    this.logger = new ConsoleLogger("Customer Generator");
  }

  public async start(): Promise<void> {
    this.logger.log("Starting customer generator...");
    while (true) {
      const batchSize = Utils.generateRandomNumber(1, 10);
      const customers = Array.from({ length: batchSize }, () =>
        this.generateCustomer()
      );
      await this.repository.upsert(customers);
      this.logger.log(`Generated ${batchSize} customers`);
      await setTimeout(GeneratorService.INTERVAL_MS);
    }
  }

  public generateCustomer(): Customer {
    return {
      _id: new ObjectId(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      address: {
        line1: faker.location.streetAddress(),
        line2: faker.location.secondaryAddress(),
        postcode: faker.location.zipCode(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
      },
      createdAt: faker.date.past(),
    };
  }
}
