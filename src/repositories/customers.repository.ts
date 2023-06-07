import { AnyBulkWriteOperation, Collection, ObjectId } from "mongodb";
import { Customer } from "../models/customer.model";
import { MongoService } from "../services/mongo.service";
import { faker } from "@faker-js/faker";

export class CustomersRepository {
  public readonly collection: Collection<Customer>;

  public constructor() {
    this.collection = MongoService.getInstance().customers;
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

  public static generateCustomer(): Customer {
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
