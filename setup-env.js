// const API_LINK = () => 'https://portfolio-api-deployment.up.railway.app/send-email';

import fs from 'fs/promises';
import 'dotenv/config';

(async () => {
  try {
    fs.writeFile('./public/script/env.js', process.env.SETUP_ENV);
    console.log('File created successfully!');
  } catch (e) {
    console.error('Error creating a file :', e);
  }
})();
