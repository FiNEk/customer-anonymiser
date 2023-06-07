import { Logger } from "../logger";
import { setTimeout } from "timers/promises";
import { CustomersRepository } from "../repositories/customers.repository";
import { Utils } from "../utils";

export class GeneratorService {
  private static readonly INTERVAL_MS = 200;
  private readonly repository: CustomersRepository;
  private readonly logger: Logger;

  public constructor() {
    this.repository = new CustomersRepository();
    this.logger = new Logger("Customer Generator");
  }

  async start(): Promise<void> {
    this.logger.log("Starting customer generator...");
    while (true) {
      const batchSize = Utils.generateRandomNumber(1, 10);
      const customers = Array.from({ length: batchSize }, () =>
        CustomersRepository.generateCustomer()
      );
      await this.repository.upsert(customers);
      this.logger.log(`Generated ${batchSize} customers`);
      await setTimeout(GeneratorService.INTERVAL_MS);
    }
  }
}
