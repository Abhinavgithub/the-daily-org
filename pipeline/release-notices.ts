import { deadlineId } from '../src/lib/deadlines';
import { linkTo, type Edition, type UpdateChange } from '../src/lib/release-edition';
import type { Notice } from './write';

// The Bulletin's alert for a Release Update that changed in the notes: a deadline moved, an update postponed,
// called off or enforced, or one new to the notes. One that left the notes is not announced: the Deadlines page
// simply no longer lists it.

const FLAGS: Record<Exclude<UpdateChange['kind'], 'removed'>, string> = { date: 'Deadline moved', status: 'Release update changed', new: 'New release update' };

/** The alert's one line, by what changed. */
const lineFor = (change: UpdateChange, release: string, deadline?: string): string => {
  switch (change.kind) {
    case 'date':
      return `The ${release} release notes moved its day from ${change.was} to ${change.now}.`;
    case 'status':
      return `The ${release} release notes now file it under "${change.now}", not "${change.was}".`;
    default:
      return `New to the ${release} release notes, filed under "${change.now}"${deadline ? `, from ${deadline}` : ''}.`;
  }
};

const headline = (change: UpdateChange): string => {
  switch (change.kind) {
    case 'date':
      return `${change.name}: now ${change.now}, was ${change.was}`;
    case 'status':
      return `${change.name}: now ${(change.now ?? '').toLowerCase()}`;
    default:
      return change.name;
  }
};

/** An alert for each Release Update that changed, as the edition now has it. */
export function updateNotices(edition: Edition, changes: UpdateChange[]): Notice[] {
  return changes.flatMap((change) => {
    if (change.kind === 'removed') return [];
    const update = edition.enforced.find((one) => one.topic === change.topic);
    // Printed on the paper's own Bulletin, so the paper's own address will do.
    const card = `/deadlines/#${deadlineId(change.topic)}`;
    return [
      {
        title: headline(change),
        url: linkTo(edition, change.topic),
        source: `${edition.release.name} release notes`,
        flag: FLAGS[change.kind],
        line: lineFor(change, edition.release.name, update?.deadline),
        facts: `As the release notes stood on ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(edition.checkedAt ?? edition.builtAt))}.`,
        body: `${update?.says ?? ''}${update?.action ? `\n\n**What to do:** ${update.action}` : ''}\n\n[See it on the Deadlines page](${card})`.trim(),
      },
    ];
  });
}
