import cron from 'node-cron';
import { processDailyRoiForAllInvestments } from '../services/roiService.js';


export const startRoiCronJob = () => {
  const schedule = process.env.ROI_CRON_SCHEDULE || '0 0 * * *'; // every day at 12:00 AM

  if (!cron.validate(schedule)) {
    console.error(`Invalid ROI_CRON_SCHEDULE expression: ${schedule}`);
    return;
  }

  cron.schedule(schedule, async () => {
    const startedAt = new Date();
    console.log(`[ROI Cron] Starting daily ROI processing at ${startedAt.toISOString()}`);
    try {
      const stats = await processDailyRoiForAllInvestments(startedAt);
      console.log(
        `[ROI Cron] Completed. Processed=${stats.processed} Credited=${stats.credited} ` +
          `Skipped(already processed)=${stats.skipped} AutoCompleted=${stats.completed}`
      );
    } catch (error) {
      console.error('[ROI Cron] Failed:', error);
    }
  });

  console.log(`ROI cron job scheduled with pattern "${schedule}"`);
};


export const runRoiJobOnce = async () => {
  return processDailyRoiForAllInvestments(new Date());
};
