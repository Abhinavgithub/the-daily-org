import { isBrief } from '../src/lib/editions';
import { prefilter, type Verdict } from './curate';
import { GIVE_UP_DAYS, givenUp, transcriptOverdue, type Waiting } from './dedupe';
import type { Extracted } from './extract';
import type { FeedItem } from './fetch';
import type { Printed } from './write';

// What the pipeline decides about each article, apart from the doing of it: pure, so that the rules can be tested
// without a run. `run.ts` acts on what these say.

/** What becomes of an article once it has been read, before any model sees it. */
export type Triage =
  /** A live event not yet held. `firstMet` is whether this run is the first to meet it so. */
  | { kind: 'upcoming'; firstMet: boolean }
  /** A video whose transcript may still come. `aired` is whether it was an upcoming event until now. */
  | { kind: 'wait'; aired: boolean }
  /** Turned away by the pre-filter. `retry` is whether its page is to be tried again next run. */
  | { kind: 'drop'; reason: string; retry: boolean }
  | { kind: 'assess' };

/**
 * A video with no transcript yet waits for one: captions often come some hours after the upload, and one refusal
 * among successes is passing trouble. It does not wait when every request was refused (`transcriptsDown`), when its
 * captions are in another language, or once it has waited long enough. A live event that has not been held has
 * nothing in it to judge, and is left alone until it has been.
 */
export function triage(item: FeedItem, content: Extracted, waiting: Waiting | undefined, day: string, transcriptsDown: boolean): Triage {
  if (content.transcript === 'upcoming') return { kind: 'upcoming', firstMet: waiting?.why !== 'upcoming' };
  // Once held, its wait for a transcript starts from now, not from when it was announced.
  const aired = waiting?.why === 'upcoming';
  const mayCome = content.transcript === 'none' || (content.transcript === 'failed' && !transcriptsDown);
  if (mayCome && (aired || !transcriptOverdue(waiting, day))) return { kind: 'wait', aired };
  // An alert is short by nature and is not held to the rules for articles.
  const reason = item.alert ? null : prefilter(item, content.text);
  if (!reason) return { kind: 'assess' };
  // Too short only because its page could not be read: tried again next run, until it has been tried for long enough.
  if (content.pageFailed && reason === 'too short') {
    const retry = !givenUp(waiting, day);
    return { kind: 'drop', retry, reason: retry ? 'its page could not be read, to be tried again next run' : `its page could not be read for ${GIVE_UP_DAYS} days` };
  }
  return { kind: 'drop', reason, retry: false };
}

/** Where an assessed article goes in the paper. `of` and `replaces` are places in the edition, from 0. */
export type Desk =
  | { desk: 'alert' }
  | { desk: 'release' }
  | { desk: 'community' }
  | { desk: 'not-relevant' }
  | { desk: 'below'; brief: boolean }
  /** The edition has this story told at least as well: a line under that one. */
  | { desk: 'repeat'; of: number }
  /** A story, in place of an earlier telling it does better when `replaces` is given. */
  | { desk: 'story'; replaces?: number };

export function route(item: FeedItem, verdict: Pick<Verdict, 'relevant' | 'interest_score' | 'same_as'>, edition: Pick<Printed, 'score'>[], threshold: number): Desk {
  // An alert is printed whatever it scores. One that is not about security is still left to the editor's view of whether it belongs.
  if (item.alert && (verdict.relevant || item.alert.always)) return { desk: 'alert' };
  // Every release of a tool is printed, as one line in the Bulletin: a reader should not have to wonder whether there was one.
  if (item.source.type === 'code') return { desk: 'release' };
  // A forum post is never a story. One the editor finds worth knowing is a line in the Bulletin, whatever it scores.
  if (item.source.type === 'discussion' && verdict.relevant) return { desk: 'community' };
  if (!verdict.relevant) return { desk: 'not-relevant' };
  // A close call is not thrown away: it is printed in brief, as the model wrote it, at no further cost.
  if (verdict.interest_score < threshold) return { desk: 'below', brief: isBrief(verdict, threshold) };
  const same = verdict.same_as ? verdict.same_as - 1 : undefined;
  if (same !== undefined && edition[same].score >= verdict.interest_score) return { desk: 'repeat', of: same };
  return same === undefined ? { desk: 'story' } : { desk: 'story', replaces: same };
}
