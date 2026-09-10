require('dotenv').config();
const db = require('../config/db');

async function upgrade() {
  console.log('Upgrading movies table...');
  const alterStatements = [
    "ALTER TABLE `movies` ADD COLUMN IF NOT EXISTS `genre` text DEFAULT NULL",
    "ALTER TABLE `movies` ADD COLUMN IF NOT EXISTS `duration` int(11) DEFAULT 120",
    "ALTER TABLE `movies` ADD COLUMN IF NOT EXISTS `age_rating` varchar(20) DEFAULT 'PG-13'",
    "ALTER TABLE `movies` ADD COLUMN IF NOT EXISTS `director` varchar(150) DEFAULT NULL",
    "ALTER TABLE `movies` ADD COLUMN IF NOT EXISTS `backdrop_url` varchar(255) DEFAULT NULL",
    "ALTER TABLE `movies` MODIFY COLUMN `status` enum('now_showing','coming_soon','archived','ended') DEFAULT 'coming_soon'"
  ];

  for (const sql of alterStatements) {
    try {
      await db.query(sql);
      console.log('Executed:', sql);
    } catch (e) {
      console.warn('Notice:', e.message);
    }
  }

  const [cols] = await db.query('DESCRIBE movies');
  console.log('Current columns:', cols.map(c => c.Field));
  process.exit(0);
}

upgrade().catch(err => {
  console.error(err);
  process.exit(1);
});
