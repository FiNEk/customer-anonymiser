import { AnyBulkWriteOperation, Collection } from "mongodb";
import { Customer } from "../models/customer.model";
import { MongoService } from "../services/mongo.service";

export class CustomersAnonymisedRepository {
  public readonly collection: Collection<Customer>;

  public constructor() {
    this.collection = MongoService.getInstance().customersAnonymized;
  }

  public async upsert(customers: Customer[]): Promise<void> {
    const bulkOps: AnyBulkWriteOperation<Customer>[] = customers.map(
      (customer) => ({
        updateOne: {
          filter: { _id: customer._id },
          update: { $set: customer },
          upsert: true,
        },
      })
    );
    await this.collection.bulkWrite(bulkOps);
  }
}
