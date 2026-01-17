// NODE PACKAGES
if (process.env.DISABLE_SCRAPERS === 'true') {
  module.exports = {};
  return;
}


// LOCAL FUNCTIONS
const logger = require('../utils/logger');
const getWorldometerPage = require('../scrapers/covid-19/getWorldometers');
const getStates = require('../scrapers/covid-19/getStates');
// const jhuLocations = require('../scrapers/covid-19/jhuLocations');
const historical = require('../scrapers/covid-19/historical');
const nytData = require('../scrapers/covid-19/nytData');
const appleData = require('../scrapers/covid-19/appleMobilityData');
const govData = require('../scrapers/covid-19/govScrapers/getGovData');
const { getVaccineData, getVaccineCoverageData, getVaccineStateCoverageData } = require('../scrapers/covid-19/getVaccine');
const getTherapeuticsData = require('../scrapers/covid-19/getTherapeutics');
const variantsData = require('../scrapers/covid-19/getVariants');
const getCDCDInfluenzaData = require('../scrapers/influenza/getCDC');

// KEYS
const { config, keys, port } = require('../config');

let redis = null;

if (!config.disableRedis) {
  const Redis = require('ioredis'); // <-- moved INSIDE
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    retryStrategy: () => null
  });
}


module.exports = {
	redis,
	port,
	keys,
	config,
	scraper: {
		getWorldometerPage,
		getStates,
		// jhuLocations,
		historical,
		nytData,
		appleData,
		executeScraper: async () => {
			await Promise.all([
				getWorldometerPage(keys, redis),
				getStates(keys, redis),
				// jhuLocations.jhudataV2(keys, redis),
				historical.historicalV2(keys, redis),
				historical.getHistoricalUSADataV2(keys, redis)
			]);
			logger.info('Finished JHU and worldometers scraping!');
		},
		executeScraperNYTData: async () => {
			await nytData(keys, redis);
			logger.info('Finished NYT scraping!');
		},
		excecuteScraperAppleData: async () => {
			await appleData(keys, redis);
			logger.info('Finished Apple scraping!');
		},
		excecuteScraperGov: async () => {
			await govData(keys, redis);
			logger.info('Finished Government scraping!');
		},
		excecuteScraperVaccine: async () => {
			await getVaccineData(keys, redis);
			logger.info('Finished Vaccine scraping!');
		},
		excecuteScraperVaccineCoverage: async () => {
			await getVaccineCoverageData(keys, redis);
			logger.info('Finished Vaccine Coverage scraping!');
		},
		excecuteScraperVaccineStateCoverage: async () => {
			await getVaccineStateCoverageData(keys, redis);
			logger.info('Finished Vaccine State Coverage scraping!');
		},
		executeScraperTherapeutics: async () => {
			await getTherapeuticsData(keys, redis);
			logger.info('Finished Therapeutics scraping!');
		},
		executeScraperVariants: async () => {
			await variantsData(keys, redis);
			logger.info('Finished Variants scraping!');
		},
		excecuteScraperInfluenza: async () => {
			await getCDCDInfluenzaData(keys, redis);
			logger.info('Finished CDC Influenza scraping!');
		}
	}
};
