const cron = require('node-cron');

/**
 * Cron Service za scheduled tasks
 * Avtomatski scraping Balkan Top 100 vsake 3 dni
 */
class CronService {
  constructor(balkanController) {
    this.balkanController = balkanController;
    this.jobs = [];
    this.isRunning = false;
  }

  /**
   * Zaženi avtomatski scraping vsake 3 dni
   * Cron pattern: '0 2 3 * *' = ob 2:00 zjutraj vsake 3 dni*/
   
  startBalkanAutoScrape() {
    // Cron schedule: vsake 3 dni ob 2:00 zjutraj
    const schedule = '0 2 */3 * *';

    console.log('⏰ Nastavljam avtomatski Balkan scraping...');
    console.log(`📅 Schedule: Vsake 3 dni ob 2:00 zjutraj`);

    const job = cron.schedule(
      schedule,
      async () => {
        console.log('🎵 [CRON] Začenjam avtomatski Balkan scraping...');

        try {
          // Simuliraj request/response za controller
          const mockReq = { body: {} };
          const mockRes = {
            json: (data) => {
              console.log('✅ [CRON] Scraping uspešen:', data.stats);
            },
            status: (code) => ({
              json: (data) => {
                console.error(`❌ [CRON] Scraping napaka (${code}):`, data);
              },
            }),
          };

          await this.balkanController.scrapeAndSave(mockReq, mockRes);
        } catch (error) {
          console.error('❌ [CRON] Kritična napaka:', error.message);
        }
      },
      {
        scheduled: true,
        timezone: 'Europe/Ljubljana', // Slovenian timezone
      }
    );

    this.jobs.push({
      name: 'balkan-auto-scrape',
      job: job,
      schedule: schedule,
    });

    console.log('✅ Avtomatski scraping nastavljen!');
    console.log('⏰ Naslednji scraping: vsake 3 dni ob 2:00');
  }

  /**
   * Zaženi test scraping (takoj)
   * Za testing purposes
   */
  async runTestScrape() {
    console.log('🧪 [TEST] Ročni test scraping...');

    try {
      const mockReq = { body: {} };
      const mockRes = {
        json: (data) => {
          console.log('✅ [TEST] Scraping uspešen:', data.stats);
        },
        status: (code) => ({
          json: (data) => {
            console.error(`❌ [TEST] Scraping napaka (${code}):`, data);
          },
        }),
      };

      await this.balkanController.scrapeAndSave(mockReq, mockRes);
    } catch (error) {
      console.error('❌ [TEST] Kritična napaka:', error.message);
    }
  }

  /**
   * Pridobi status vseh cron jobs
   */
  getJobsStatus() {
    return this.jobs.map((job) => ({
      name: job.name,
      schedule: job.schedule,
      isRunning: job.job.running,
    }));
  }

  /**
   * Ustavi vse cron jobs
   */
  stopAllJobs() {
    console.log('🛑 Ustavljam vse cron jobs...');
    this.jobs.forEach((job) => {
      job.job.stop();
      console.log(`   ✓ Ustavljen: ${job.name}`);
    });
    console.log('✅ Vsi cron jobs ustavljeni');
  }

  /**
   * Zaženi vse cron jobs
   */
  startAllJobs() {
    console.log('▶️  Zaganjam vse cron jobs...');
    this.jobs.forEach((job) => {
      job.job.start();
      console.log(`   ✓ Zagnan: ${job.name}`);
    });
    console.log('✅ Vsi cron jobs zagnani');
  }
}

module.exports = CronService;