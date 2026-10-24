// Educational synthetic counters; no network, server, credentials or app required.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const results = [];
function record(name, input, calculated, expected) {
  assert.deepEqual(calculated, expected, name);
  results.push({ name, input, calculated, passed: true });
}
const percent = (part, whole) => whole > 0 && part >= 0 ? part / whole * 100 : null;
const interval = { elapsedUsec: 2_000_000, usageBeforeUsec: 1_000_000, usageAfterUsec: 4_000_000, capacityCores: 2 };
const consumed = interval.usageAfterUsec - interval.usageBeforeUsec;
record('same-work-different-denominator', interval, {
  coreEquivalentPercent: percent(consumed, interval.elapsedUsec),
  capacityPercent: percent(consumed, interval.elapsedUsec * interval.capacityCores)
}, { coreEquivalentPercent: 150, capacityPercent: 75 });

const pressure = { elapsedUsec: 2_000_000, someTotalBeforeUsec: 100_000, someTotalAfterUsec: 500_000 };
record('pressure-is-waiting-not-usage', pressure, {
  intervalWaitingPercent: percent(pressure.someTotalAfterUsec - pressure.someTotalBeforeUsec, pressure.elapsedUsec),
  cpuUsagePercent: null, avg10: null
}, { intervalWaitingPercent: 20, cpuUsagePercent: null, avg10: null });

const throttle = { periodsBefore: 100, periodsAfter: 110, throttledBefore: 7, throttledAfter: 15 };
record('throttled-periods-not-time-lost', throttle, {
  throttledPeriodPercent: percent(throttle.throttledAfter - throttle.throttledBefore, throttle.periodsAfter - throttle.periodsBefore),
  cpuTimeLostPercent: null
}, { throttledPeriodPercent: 80, cpuTimeLostPercent: null });

const memory = { currentMiB: 512, inactiveFileMiB: 128, limitMiB: 1024 };
record('raw-memory-versus-cache-adjusted', memory, {
  rawMiB: memory.currentMiB,
  cacheAdjustedMiB: memory.currentMiB - memory.inactiveFileMiB,
  cacheAdjustedLimitPercent: percent(memory.currentMiB - memory.inactiveFileMiB, memory.limitMiB)
}, { rawMiB: 512, cacheAdjustedMiB: 384, cacheAdjustedLimitPercent: 37.5 });

record('no-local-quota-does-not-establish-capacity', { cpuMax: 'max 100000', memoryMax: 'max', ancestorLimits: 'unknown', cpuset: 'unknown' }, {
  capacityCores: null, capacityPercent: null, memoryLimitPercent: null
}, { capacityCores: null, capacityPercent: null, memoryLimitPercent: null });

const reset = { usageBeforeUsec: 4_000_000, usageAfterUsec: 100_000, elapsedUsec: 2_000_000 };
record('counter-reset-needs-new-baseline', reset, {
  usagePercent: percent(reset.usageAfterUsec - reset.usageBeforeUsec, reset.elapsedUsec),
  nextAction: 'take a fresh baseline'
}, { usagePercent: null, nextAction: 'take a fresh baseline' });

const report = { verifiedOn: '2026-10-24', kind: 'synthetic arithmetic fixture',
  liveServer: false, nexusGuiTest: false, passed: results.length, results };
const body = JSON.stringify(report, null, 2) + '\n';
if (process.argv.includes('--record')) {
  fs.writeFileSync(new URL('../docs/fixtures/container-resource-readings.json', import.meta.url), body);
} else {
  assert.equal(fs.readFileSync(new URL('../docs/fixtures/container-resource-readings.json', import.meta.url), 'utf8'), body, 'recorded results must match');
}
console.log(body);
