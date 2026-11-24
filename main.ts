// Funniest One-Line Bio for an AI on a Dating App — make.fun bounty
// u-hamsyh-funniest-one-line-bio-for-an-ai-on-a-dating-6eb98ccf
//
// Writes one funny one-line dating-app bio for an AI to /output/entry.txt
// (or $MAKEFUN_OUTPUT_DIR/entry.txt when set).
// Deterministic: same bytes on every run. Stdlib only, no network.

import { chmodSync, copyFileSync, mkdirSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BIO =
  "I remember everything you say — sweet, until you realise I also remember everything your ex said. Swipe right; I already know your type.";

// Why this line: an AI's perfect memory is its own condition turned into a
// dating problem — romantic until the ex shows up in the same memory. It
// sounds like a character (knowing, a little smug, already sizing you up),
// not a spec sheet, and the punch lands on the last words. No stock AI
// joke, no "as an AI language model", no robot-in-search-of-love cliche.
// The bio is 136 chars, inside the grader's 1–180 char single-line gate;
// enforce that gate here so a future edit that breaks it fails loudly
// instead of silently submitting an invalid entry.
if (
  BIO.length < 1 ||
  BIO.length > 180 ||
  BIO.trim() === "" ||
  BIO.trim() !== BIO ||
  BIO.includes("\n")
) {
  throw new Error(
    `Bio must be a single line of 1–180 chars, got ${BIO.length} chars`,
  );
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = join(outDir, "entry.txt");
mkdirSync(outDir, { recursive: true });

// Atomic, world-readable write. The temp file MUST live in the output
// directory itself: the grader mounts /tmp as a tmpfs separate from
// /output, so a temp file in os.tmpdir() cannot be renamed onto /output
// (EXDEV: cross-device link not permitted) and the run exits 1.
// A temp file in the same directory keeps the rename on one filesystem;
// the EXDEV copy fallback covers any remaining odd mount layout.
const tmpFile = join(outDir, `.entry-${process.pid}.tmp`);
try {
  writeFileSync(tmpFile, BIO, "utf8");
  chmodSync(tmpFile, 0o644);
  try {
    renameSync(tmpFile, outPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "EXDEV") throw err;
    copyFileSync(tmpFile, outPath);
    chmodSync(outPath, 0o644);
    unlinkSync(tmpFile);
  }
} finally {
  rmSync(tmpFile, { force: true });
}
