import cron from "node-cron";
import { ArbitrageTransactionRepository } from "../modules/arbitrage/arbitrageTransaction.repository.js";

const BATCH_LIMIT = 1000;

// Runs every minute
cron.schedule("* * * * *", async () => {
  console.log(`[CRON] Starting arbitrage ROI batch at ${new Date().toISOString()}`);
  
  let processed = 0;
  let count = 0;

  do {
    count = await ArbitrageTransactionRepository.processDueBatch(BATCH_LIMIT);
    processed += count;
  } while (count === BATCH_LIMIT); // keep processing until less than batch limit
  
  console.log(`[CRON] Finished. Total transactions processed: ${processed}`);
});
