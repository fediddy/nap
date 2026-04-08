#!/usr/bin/env node
/**
 * sync-brain.js
 * Reads sprint-status.yaml and updates Epics/Implementation-Status.md
 * with current story completion state from actual git history.
 *
 * Run: node scripts/sync-brain.js
 * Auto-run: .git/hooks/post-commit
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SPRINT_STATUS = path.join(ROOT, '_bmad-output/implementation-artifacts/sprint-status.yaml');
const BRAIN_FILE = path.join(ROOT, 'Epics/Implementation-Status.md');

function parseSprintStatus(content) {
  const status = {};
  const lines = content.split('\n');
  let inDev = false;

  for (const line of lines) {
    if (line.trim() === 'development_status:') { inDev = true; continue; }
    if (!inDev) continue;
    if (line.trim().startsWith('#')) continue;

    const match = line.match(/^\s{2}([\w-]+):\s*(done|in.progress|not.started|optional)/i);
    if (match) status[match[1]] = match[2];
  }
  return status;
}

function getImplementationEvidence(storyId) {
  try {
    // git log --name-only --pretty=format: --grep=<pattern>
    const shortId = storyId.split('-').slice(0, 2).join('-'); // e.g. "1-1"
    const output = execFileSync('git', [
      'log', '--name-only', '--pretty=format:', `--grep=${shortId}`
    ], { cwd: ROOT, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();

    const files = output.split('\n')
      .filter(f => f.startsWith('apps/') || f.startsWith('packages/'));
    return [...new Set(files)]; // dedupe
  } catch {
    return [];
  }
}

function statusEmoji(val) {
  if (!val) return '❓';
  if (val === 'done') return '✅';
  if (val.includes('progress')) return '🔄';
  if (val === 'optional') return '⚪';
  return '⬜';
}

const EPICS = {
  'epic-1': {
    title: 'Epic 1 — Business Profile Management',
    stories: [
      '1-1-project-scaffolding-and-infrastructure-setup',
      '1-2-create-individual-business-profile',
      '1-3-list-search-and-filter-business-profiles',
      '1-4-edit-and-deactivate-business-profile',
      '1-5-basic-csv-bulk-import',
    ],
  },
  'epic-2': {
    title: 'Epic 2 — Data Import & Validation Engine',
    stories: [
      '2-1-csv-validation-format-and-completeness-checks',
      '2-2-duplicate-detection-during-import',
      '2-3-inline-error-fixing-in-import-preview',
      '2-4-change-detection-and-diff-view-on-re-import',
    ],
  },
  'epic-3': {
    title: 'Epic 3 — Directory Submission Pipeline',
    stories: [
      '3-1-browser-automation-infrastructure-and-napbrowserprofile',
      '3-2-session-relay-and-cookie-handoff',
      '3-3-directory-adapter-pattern-and-base-infrastructure',
      '3-4-bing-places-adapter-file-export',
      '3-5-facebook-business-adapter-camoufox-browser',
      '3-6-yelp-business-adapter-camoufox-browser',
      '3-7-submission-plan-preview-and-approval-gate',
      '3-8-queue-infrastructure-rate-limiting-and-retry',
    ],
  },
  'epic-4': {
    title: 'Epic 4 — Update Propagation & Lifecycle',
    stories: [
      '4-1-push-profile-updates-to-active-directory-listings',
      '4-2-per-directory-business-name-override',
      '4-3-listing-removal-for-deactivated-businesses',
      '4-4-pause-and-resume-directory-submissions',
    ],
  },
  'epic-5': {
    title: 'Epic 5 — Monitoring Dashboard',
    stories: [
      '5-1-summary-dashboard',
      '5-2-status-matrix-business-x-directory-grid',
      '5-3-action-queue',
      '5-4-per-business-citation-profile-detail',
      '5-5-batch-level-status-tracking',
    ],
  },
  'epic-6': {
    title: 'Epic 6 — Directory Registry & Health',
    stories: [
      '6-1-directory-registry-list-and-health-overview',
      '6-2-automated-directory-health-monitoring-and-auto-pause',
      '6-3-add-new-directory-to-registry',
    ],
  },
  'epic-7': {
    title: 'Epic 7 — Reporting & Export',
    stories: [
      '7-1-full-data-export-to-csv',
      '7-2-nap-consistency-check',
    ],
  },
};

function main() {
  if (!fs.existsSync(SPRINT_STATUS)) {
    console.error('sprint-status.yaml not found at', SPRINT_STATUS);
    process.exit(1);
  }

  const yaml = fs.readFileSync(SPRINT_STATUS, 'utf8');
  const status = parseSprintStatus(yaml);

  const now = new Date().toISOString().split('T')[0];
  let md = `> Part of [[Epics]]\n\n`;
  md += `# Implementation Status\n\n`;
  md += `> Auto-synced from sprint-status.yaml on ${now}\n\n`;
  md += `**Note**: "done" in plan status = story doc complete, not necessarily code written. `;
  md += `"Evidence" column shows actual git commits touching source files.\n\n`;

  for (const [epicKey, epic] of Object.entries(EPICS)) {
    const epicStatus = status[epicKey];
    md += `## ${statusEmoji(epicStatus)} ${epic.title}\n\n`;
    md += `| Story | Plan | Evidence |\n`;
    md += `|-------|------|----------|\n`;

    for (const storyId of epic.stories) {
      const s = status[storyId] || 'unknown';
      const evidence = getImplementationEvidence(storyId);
      const evidenceStr = evidence.length > 0
        ? `${evidence.length} source file(s) committed`
        : 'no commits found';
      md += `| \`${storyId}\` | ${statusEmoji(s)} ${s} | ${evidenceStr} |\n`;
    }
    md += '\n';
  }

  md += `---\n*Last synced: ${now} — [scripts/sync-brain.js](../scripts/sync-brain.js)*\n`;

  fs.writeFileSync(BRAIN_FILE, md);
  console.log(`Brain synced → Epics/Implementation-Status.md (${now})`);
}

main();
