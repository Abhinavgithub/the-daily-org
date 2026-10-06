import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contextIn, entriesIn, helpTopic, introOf, releaseNamed, topicUrl } from './release-notes';

const link = (topic: string) => `/apex/HTViewHelpDoc?id=release-notes.${topic}.htm`;
const area = `<?xml version="1.0" encoding="UTF-8"?><html><head><title>x</title></head><body>
  <h1>Automation</h1><p>Compose intelligent workflows.</p>
  <ul>
    <li class="a"><strong><a href="${link('rn_automate_flow')}">Flow Builder</a></strong><br/><span>Run a screen flow on many records. Capture time values.</span></li>
    <li><strong><a href="${link('rn_automate_archive')}">Automation Archived Release Notes</a></strong><br/>Older notes.</li>
  </ul>
  <div><h4>See Also</h4><ul><li><a href="https://example.com/help">Elsewhere</a></li></ul></div>
  <div><h2>Automation Release Note Changes by Month</h2><div><h3>October 2026</h3><ul>
    <li><strong>Screen Flows</strong>:<a href="${link('rn_reactive')}" title="Reference reactive formulas in visibility rules.">Evaluate Visibility Rules with Reactive Formulas</a>(Added the week of October 5, 2026)</li>
    <li><strong>Data Processing</strong>:<a href="https://help.salesforce.com/s/articleView?id=release-notes.rn_dpe.htm&amp;release=264&amp;type=5">Control Currency Handling</a></li>
  </ul></div></div></body></html>`;

test('a page of the notes gives its children and the features it lists, and leaves what leads elsewhere', () => {
  assert.equal(introOf(area), 'Compose intelligent workflows.');
  assert.deepEqual(entriesIn(area), [
    { topic: 'release-notes.rn_automate_flow.htm', title: 'Flow Builder', text: 'Run a screen flow on many records. Capture time values.', kind: 'child' },
    { topic: 'release-notes.rn_reactive.htm', title: 'Evaluate Visibility Rules with Reactive Formulas', text: 'Reference reactive formulas in visibility rules.', group: 'Screen Flows', kind: 'feature' },
    { topic: 'release-notes.rn_dpe.htm', title: 'Control Currency Handling', text: '', group: 'Data Processing', kind: 'feature' },
  ]);
});

test('a change Salesforce enforces is read with its own paragraph and the section it stands under', () => {
  const updates = `<html><body><h1>Release Updates</h1><p>About them.</p>
    <div><h2>Enforced with This
        Release</h2><p>These are enforced.</p>
      <dl><dt><a href="${link('rn_soap')}" title="All users must have the permission. Beginning December 1, 2026, it is enforced.">Assign the Permission (Release Update)</a></dt><dd>All users must have the permission.</dd></dl>
    </div>
    <div><h2>Scheduled to Be Enforced in Spring ’27</h2><dl><dt><a href="${link('rn_later')}">A Later One</a></dt><dd>It comes later.</dd></dl></div></body></html>`;
  assert.deepEqual(entriesIn(updates), [
    { topic: 'release-notes.rn_soap.htm', title: 'Assign the Permission (Release Update)', text: 'All users must have the permission. Beginning December 1, 2026, it is enforced.', group: 'Enforced with This Release', kind: 'term' },
    { topic: 'release-notes.rn_later.htm', title: 'A Later One', text: 'It comes later.', group: 'Scheduled to Be Enforced in Spring ’27', kind: 'term' },
  ]);
});

test('the help site’s own values are found in its page, and a release is named from its notes’ title', () => {
  const shell = `<script>window.x = "%7B%22app%22%3A%22siteforce%3AcommunityApp%22%2C%22fwuid%22%3A%22ABC123%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fsiteforce%3AcommunityApp%22%3A%221881_xyz%22%7D%7D 100% done"</script>`;
  assert.deepEqual(contextIn(shell), { fwuid: 'ABC123', app: '1881_xyz' });
  assert.equal(contextIn('<html>nothing here</html>'), undefined);
  assert.equal(releaseNamed("Salesforce Winter '27 Release Notes"), "Winter '27");
  assert.equal(releaseNamed('Salesforce Summer ’26 Release Notes'), "Summer '26");
  assert.equal(releaseNamed('Release Notes'), undefined);
  assert.equal(topicUrl('release-notes.rn_soap.htm', '264.0.0'), 'https://help.salesforce.com/s/articleView?id=release-notes.rn_soap.htm&release=264&type=5');
});

test('a topic is asked for as the help site asks, and one with no notes says which release has them', async () => {
  const sent: { url: string; body: string }[] = [];
  const answer = (value: object) =>
    (async (url: unknown, init?: RequestInit) => {
      sent.push({ url: String(url), body: String(init?.body) });
      return new Response(JSON.stringify({ actions: [{ state: 'SUCCESS', returnValue: { returnValue: value } }] }));
    }) as typeof fetch;
  const context = { fwuid: 'F', app: 'A' };

  const found = await helpTopic('release-notes.rn_automate.htm', '264.0.0', context, answer({ type: 'HelpDocs', latestRNVersion: '264.0.0', record: { Content__c: '<html><body><h1>Automation</h1></body></html>', Title__c: 'Automation', Published_Date__c: '2026-10-06T07:19:04.000Z' } }));
  assert.deepEqual([found.found, found.title, found.published, found.latest], [true, 'Automation', '2026-10-06T07:19:04.000Z', '264.0.0']);
  const asked = new URLSearchParams(sent[0].body);
  assert.match(asked.get('message') ?? '', /"classname":"Help_ArticleDataController","method":"getData".*"urlName":"release-notes\.rn_automate\.htm".*"release":"264\.0\.0"/);
  assert.match(asked.get('aura.context') ?? '', /"fwuid":"F".*"APPLICATION@markup:\/\/siteforce:communityApp":"A"/);

  const none = await helpTopic('release-notes.salesforce_release_notes.htm', '266.0.0', context, answer({ type: 'NotFound', latestRNVersion: '264.0.0' }));
  assert.deepEqual([none.found, none.latest], [false, '264.0.0']);
  const tooLong = await helpTopic('x', '264.0.0', context, answer({ type: 'HelpDocs', record: { Content__c: 'Cannot populate due to large Document size - 1420309 characters.' } }));
  assert.equal(tooLong.found, false, 'a topic the site will not hand over is not a topic read');

  const refused = (async () => new Response(JSON.stringify({ actions: [{ state: 'ERROR' }] }))) as typeof fetch;
  await assert.rejects(helpTopic('x', '264.0.0', context, refused), /refused the request \(ERROR\)/);
});
