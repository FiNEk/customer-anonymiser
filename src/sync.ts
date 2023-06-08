import { config } from "dotenv";
import { AnonymizerService } from "./services/anonymizer.service";
import { MongoService } from "./services/mongo.service";

async function main() {
  config();
  const mongoService = MongoService.getInstance();
  await mongoService.connect();
  const anonymiserService = new AnonymizerService();
  const isFullReindex = process.argv.includes("--full-reindex");
  if (isFullReindex) {
    await anonymiserService.fullReindex();
    return;
  }
  await anonymiserService.start();
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
