// run-allure.js
import { execSync } from 'child_process';
import { argv } from 'process';

const args = argv.slice(2);
const spec = args[0] || 'tests';
const cmd = `npx playwright test ${spec} && npm run report:generate && npm run report:open`;

try {
  execSync(cmd, { stdio: 'inherit' });
} catch (err) {
  console.error('Test or report generation failed.');
  process.exit(1);
}
