#!/usr/bin/env node
/**
 * Pull email fragments out of Document Authoring and into the repo.
 *
 * Why this exists
 * ---------------
 * DA and the repo are two different stores, and only one of them serves a file
 * unprocessed. A fragment authored in DA is delivered through the content
 * pipeline, which keeps `<body><main><div>` section structure and discards
 * everything else — head, `<style>`, and the table markup an email is made of.
 * Verified on this site: an 8.5 KB email fragment comes back from
 * `.plain.html` as 13 bytes of `<div></div>`.
 *
 * A file committed to the repo, by contrast, is served byte-for-byte. Also
 * verified: `/DESIGN.json` returns 16,851 bytes, identical to the working copy.
 *
 * So authors keep editing in DA (the fragment stays the canonical artifact) and
 * this job copies each published fragment into `email-templates/`, where it
 * renders. The repo copy is a build output, never edited by hand.
 *
 * Auth
 * ----
 * Prefers IMS server-to-server credentials, because the alternative does not
 * survive contact with CI: a DA session token carries `expires_in: 86400000`,
 * so a pasted `DA_TOKEN` stops working within a day. `DA_TOKEN` is kept as a
 * manual-run escape hatch, not as the intended path.
 *
 * Env:
 *   DA_CLIENT_ID / DA_CLIENT_SECRET   IMS technical account (preferred)
 *   DA_IMS_SCOPE                      scope list for the exchange
 *   DA_TOKEN                          a bearer token, used only if the above are absent
 *   DA_ORG / DA_REPO / DA_PATH        source location in DA
 *   DEST_DIR                          repo directory to write into
 */

import {
  mkdir, readdir, readFile, unlink, writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';

const ORG = process.env.DA_ORG || 'aiproductsignals-test';
const REPO = process.env.DA_REPO || 'aem-boilerplate';
const SRC_PATH = process.env.DA_PATH || 'fragments/emails';
const DEST_DIR = process.env.DEST_DIR || 'email-templates';
const IMS_HOST = process.env.DA_IMS_HOST || 'https://ims-na1.adobelogin.com';
const ADMIN = 'https://admin.da.live';
const MIN_BYTES = Number(process.env.MIN_FRAGMENT_BYTES || 2000);

/** Exchange IMS technical-account credentials for a short-lived access token. */
async function tokenFromIms(clientId, clientSecret) {
  const scope = process.env.DA_IMS_SCOPE || 'openid,AdobeID,aem.frontend.all';
  const res = await fetch(`${IMS_HOST}/ims/token/v3`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope,
    }),
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`IMS token exchange failed (${res.status}). Scope was "${scope}". ${body.slice(0, 300)}`);
  }
  const { access_token: accessToken } = JSON.parse(body);
  if (!accessToken) throw new Error('IMS returned no access_token.');
  return accessToken;
}

async function resolveToken() {
  const id = process.env.DA_CLIENT_ID;
  const secret = process.env.DA_CLIENT_SECRET;
  if (id && secret) {
    process.stdout.write('auth: IMS server-to-server\n');
    return tokenFromIms(id, secret);
  }
  if (process.env.DA_TOKEN) {
    process.stdout.write('auth: static DA_TOKEN (expires within ~24h — not durable for scheduled runs)\n');
    return process.env.DA_TOKEN;
  }
  throw new Error('No credentials. Set DA_CLIENT_ID + DA_CLIENT_SECRET, or DA_TOKEN.');
}

async function daFetch(token, url) {
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} from ${url.replace(ADMIN, '')}`);
  }
  return res;
}

/** List the .html sources DA holds at SRC_PATH. */
async function listFragments(token) {
  const res = await daFetch(token, `${ADMIN}/list/${ORG}/${REPO}/${SRC_PATH}`);
  const entries = await res.json();
  if (!Array.isArray(entries)) throw new Error('DA list did not return an array.');
  return entries
    .filter((e) => e.ext === 'html')
    .map((e) => `${e.name}.html`)
    .sort();
}

/**
 * Read one source. The endpoint has returned both a raw body and a
 * JSON-encoded string depending on how it is called, so accept either rather
 * than writing a quoted string to disk and only noticing in the browser.
 */
async function readFragment(token, name) {
  const res = await daFetch(token, `${ADMIN}/source/${ORG}/${REPO}/${SRC_PATH}/${name}`);
  const text = await res.text();
  const type = res.headers.get('content-type') || '';
  if (type.includes('json')) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'string') return parsed;
    } catch {
      /* not JSON after all — fall through to the raw body */
    }
  }
  return text;
}

/**
 * Does this look like the email we authored, or like something DA rewrote?
 *
 * DA stores content in its own model. Asked to hold a standalone email it can
 * normalise the source at rest — observed on this site: an 8,998-byte fragment
 * came back as 213 bytes of `<body><header></header><main><div>…`, the table
 * shell gone and the wordmark reinterpreted as a block name.
 *
 * The rendering artifact must never inherit that. A fragment that fails here is
 * left alone in the repo — the previous good copy stands — and the run exits
 * non-zero so someone looks at DA rather than shipping the wreckage.
 */
function emailShapeErrors(name, body) {
  const errs = [];
  if (body.length < MIN_BYTES) errs.push(`only ${body.length} bytes (floor ${MIN_BYTES})`);
  if (!body.includes('<table')) errs.push('no <table> — the email shell is gone');
  if (!/class="shell"/.test(body)) errs.push('no 600px shell table');
  if (/<main>/.test(body)) errs.push('contains <main> — this is EDS content, not an email');
  return errs.length ? `${name}: ${errs.join('; ')}` : null;
}

async function existingFiles() {
  try {
    return (await readdir(DEST_DIR)).filter((f) => f.endsWith('.html')).sort();
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function main() {
  const token = await resolveToken();
  const remote = await listFragments(token);

  // A failed or empty listing must never be read as "delete everything".
  if (remote.length === 0) {
    throw new Error(`DA returned 0 html sources at ${SRC_PATH}. Refusing to sync — this would delete every synced file.`);
  }

  await mkdir(DEST_DIR, { recursive: true });
  const before = await existingFiles();

  let written = 0;
  let unchanged = 0;
  const rejected = [];
  for (const name of remote) {
    const body = await readFragment(token, name);
    const shapeError = emailShapeErrors(name, body);
    if (shapeError) {
      rejected.push(shapeError);
      process.stdout.write(`  REJECT ${name} — keeping existing repo copy\n`);
    } else {
      const dest = join(DEST_DIR, name);
      let current = null;
      try {
        current = await readFile(dest, 'utf8');
      } catch {
        /* new file */
      }
      if (current === body) {
        unchanged += 1;
      } else {
        await writeFile(dest, body);
        written += 1;
        process.stdout.write(`  write  ${name} (${body.length} bytes)\n`);
      }
    }
  }

  const rejectedNames = new Set(rejected.map((r) => r.split(':')[0]));
  const removed = before.filter((f) => !remote.includes(f) && !rejectedNames.has(f));
  for (const name of removed) {
    await unlink(join(DEST_DIR, name));
    process.stdout.write(`  delete ${name} (gone from DA)\n`);
  }

  process.stdout.write(
    `\n${remote.length} fragment(s) in DA · ${written} written · ${unchanged} unchanged · ${removed.length} removed`
    + `${rejected.length ? ` · ${rejected.length} REJECTED` : ''}\n`,
  );

  if (rejected.length) {
    throw new Error(
      `${rejected.length} fragment(s) in DA no longer look like emails. The repo copies were left `
      + 'untouched. Re-publish these from the canonical files, and do not open them in the da.live '
      + `editor:\n  - ${rejected.join('\n  - ')}`,
    );
  }
}

main().catch((err) => {
  process.stderr.write(`\nsync-da-fragments failed: ${err.message}\n`);
  process.exit(1);
});
