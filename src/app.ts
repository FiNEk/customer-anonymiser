import { config } from "dotenv";
import { MongoService } from "./services/mongo.service";
import { GeneratorService } from "./services/generator.service";

async function main() {
  config();
  await MongoService.getInstance().connect();
  const generator = new GeneratorService();
  await generator.start();
}

main()
  .then(async () => {
    await MongoService.getInstance().disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await MongoService.getInstance().disconnect();
    process.exit(1);
  });
