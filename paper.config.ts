import { definePaper } from './src/paper';

// This file is the paper. Change it to change what the paper is called, what it
// covers and where it reads from; nothing else in the project names a subject.
// `npm run check-paper` tries every source and reports what it finds.

export default definePaper({
  name: 'The Daily Org',
  tagline: 'The independent daily for Salesforce admins, developers and architects',
  accent: 'Org',
  shares: { symbol: 'CRM', name: 'Salesforce' },
  description:
    'A daily newspaper of the Salesforce stories worth reading, scored and summarised for developers, admins and architects.',
  creator: { name: 'Abhinav', url: 'https://www.salesforce.com/trailblazer/asingh0187' },
  timezone: 'Asia/Kolkata',
  address: 'https://thedailyorg.com',
  repository: 'https://github.com/Abhinavgithub/the-daily-org',

  // How the editor is told what the paper is about. Each reads as part of a sentence.
  topic: 'Salesforce technology',
  readers: 'Salesforce developers, admins and architects',
  relevant:
    'teaches a practitioner something about building on, configuring or architecting Salesforce, or reports a change to the platform that they will have to work with: a release and what is in it, a new product, model or capability, or a retirement',
  notRelevant:
    'product marketing, pieces written for business or marketing leaders rather than for practitioners, customer success stories, promotion of an event still to come, sponsored comparisons, hiring posts, and anything not about Salesforce technology',
  disclaimer: 'not affiliated with or endorsed by Salesforce',
  // The dates of the coming releases, from Salesforce's Trust site, for the Bulletin.
  releases: 'salesforce-trust',
  // A release edition for each release, from Salesforce's own release notes. These are the notes' own names for
  // their areas. Customization and Development point to Platform in Winter '27, and are kept in case that changes.
  releaseNotes: {
    from: 'salesforce-help',
    areas: ['Agentforce and Generative AI', 'AIforce', 'Automation', 'Customization', 'Data 360', 'Development', 'Platform', 'Sales', 'Service', 'Slack Integrations'],
    bar: 7,
  },
  // Security advisories and wide incidents, also from Trust. They are printed in the Bulletin whatever they score.
  alerts: 'salesforce-trust',

  sections: [
    { id: 'apex-and-platform', label: 'Apex and platform' },
    { id: 'lwc-and-ui', label: 'LWC and UI' },
    { id: 'agentforce-and-ai', label: 'Agentforce and AI' },
    { id: 'data-cloud', label: 'Data Cloud' },
    { id: 'flow-and-admin', label: 'Flow and admin' },
    { id: 'integration', label: 'Integration' },
    { id: 'devops', label: 'DevOps' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'releases', label: 'Releases' },
    { id: 'career-and-certs', label: 'Career and certifications' },
  ],

  personas: [
    { id: 'developer', label: 'Developers' },
    { id: 'admin', label: 'Admins' },
    { id: 'architect', label: 'Architects' },
  ],

  // Every address here was checked with a real request on 2026-10-04, using the
  // identity in `bot` below.
  // Not available: apexhours.com/feed answers with a challenge page instead of a
  // feed (tried again 2026-10-04), and salesforce.stackexchange.com refuses
  // automated readers (it has an API, which is the right way in).
  // Removed on 2026-10-04: Medium's salesforce tag (medium.com/feed/tag/salesforce). The feed
  // answers, but it carries only a teaser and every article page refuses to be read, so
  // nothing from it could ever be reviewed.
  // Candidates: note feeds worth trying here, and what `npm run try-source -- <address>` said of them.
  //   Salesforce Geek, Salesforce Emily, Coding With The Force (YouTube): channel IDs not known; none uploaded in late Sept 2026.
  sources: [
    // Tools. Every release is printed, as a line in the Bulletin. The CLI's feed is empty nightly builds, so its notes file is read;
    // Code Analyzer's entries only say "see release notes", so the notes page is read for each.
    { id: 'sf-cli', name: 'Salesforce CLI', url: 'https://raw.githubusercontent.com/forcedotcom/cli/main/releasenotes/README.md', type: 'code', changelog: true, personas: ['developer'] },
    {
      id: 'sf-code-analyzer',
      name: 'Salesforce Code Analyzer',
      url: 'https://github.com/forcedotcom/code-analyzer/releases.atom',
      type: 'code',
      notes: 'https://developer.salesforce.com/docs/platform/salesforce-code-analyzer/guide/release-notes.html',
      personas: ['developer'],
    },
    { id: 'lwc', name: 'Lightning Web Components', url: 'https://github.com/salesforce/lwc/releases.atom', type: 'code', personas: ['developer'] },

    // Official
    { id: 'sf-developers', name: 'Salesforce Developers Blog', url: 'https://developer.salesforce.com/blogs/feed', type: 'official', personas: ['developer'] },
    { id: 'sf-admins', name: 'Salesforce Admins Blog', url: 'https://admin.salesforce.com/feed', type: 'official', personas: ['admin'] },
    { id: 'sf-engineering', name: 'Salesforce Engineering', url: 'https://engineering.salesforce.com/feed/', type: 'official', personas: ['developer', 'architect'] },
    { id: 'sf-architects', name: 'Salesforce Architects', url: 'https://www.salesforce.com/blog/category/architects/feed/', type: 'official', personas: ['architect'] },
    // The newsroom: mostly announcements, so only items that mention a keyword are reviewed.
    { id: 'sf-news', name: 'Salesforce News', url: 'https://www.salesforce.com/news/feed/', type: 'official', noisy: true },

    // Community
    { id: 'salesforce-ben', name: 'Salesforce Ben', url: 'https://www.salesforceben.com/feed/', type: 'community' },
    { id: 'andy-in-the-cloud', name: 'Andy in the Cloud', url: 'https://andyinthecloud.com/feed/', type: 'community', personas: ['developer', 'architect'] },
    { id: 'beyond-the-cloud', name: 'Beyond the Cloud', url: 'https://blog.beyondthecloud.dev/blog/rss.xml', type: 'community', personas: ['developer'] },
    { id: 'bob-buzzard', name: 'Bob Buzzard Blog', url: 'https://bobbuzzard.blogspot.com/feeds/posts/default', type: 'community', personas: ['developer'] },
    { id: 'salesforce-time', name: 'Salesforce Time', url: 'https://salesforcetime.com/feed/', type: 'community', personas: ['admin'] },
    { id: 'cloud-odyssey', name: 'Cloud Odyssey', url: 'https://www.cloudodyssey.co/feed/', type: 'community' },
    { id: 'infallibletechie', name: 'InfallibleTechie', url: 'https://www.infallibletechie.com/feed/', type: 'community', personas: ['developer', 'admin'] },
    { id: 'salesforcecodex', name: 'SalesforceCodex', url: 'https://salesforcecodex.com/feed/', type: 'community', personas: ['developer', 'architect'] },
    { id: 'salesforce-break', name: 'Salesforce Break', url: 'https://salesforcebreak.com/feed/', type: 'community', personas: ['admin', 'developer'] },

    // The community. A post is printed, as one line in the Bulletin, only when it reports something a
    // practitioner needs to know. Reddit refuses a reader that asks more than once or twice in a row.
    // It is last so that, on a run that reaches its cap on calls, the articles above have been judged first.
    {
      id: 'reddit-salesforce',
      name: 'r/salesforce',
      url: 'https://www.reddit.com/r/salesforce/.rss',
      type: 'discussion',
      relevant:
        'reports something a practitioner needs to know and may not have heard: a change, notice or email from Salesforce explained, a confirmed fault, an outage, a limit or behaviour that surprised someone, or a workaround that works',
      notRelevant:
        'a request for help with the poster\'s own problem, an opinion or a question put to the room, talk of careers, pay, certifications or hiring, a poll, and anyone promoting their own tool, service, post or video',
    },
  ],

  // An item from a source marked `noisy` is kept only if one of these appears in it.
  // Each is a regular expression fragment, matched as a whole word, in any case.
  keywords: [
    'apex', 'soql', 'sosl', 'lwc', 'lightning web component', 'aura', 'visualforce', 'flow', 'agentforce',
    'einstein', 'data cloud', 'data 360', 'mulesoft', 'heroku', 'sfdx', 'salesforce cli', 'scratch org',
    'sandbox', 'metadata', 'devops center', 'omnistudio', 'permission set', 'governor limit', 'trigger',
    'platform event', 'named credential', 'connected app', 'external client app', 'rest api', 'bulk api',
    'pub/sub', 'slack', 'tableau', 'experience cloud', 'release notes?',
    String.raw`(spring|summer|winter) '?\d\d`, 'certification', 'trailhead', 'well-architected',
    'prompt (builder|template)', 'mcp', 'packag(e|ing)', 'isv', 'appexchange', 'integration', 'admin',
    'developer', 'architect',
  ],

  // Only unambiguous terms belong here. A bare "flow", "trigger" or "profile" is
  // usually ordinary English and is left alone. Give the singular; a trailing "s"
  // in the text is kept.
  glossary: [
    'Custom Metadata Type',
    'Custom Metadata',
    'Custom Object',
    'Custom Setting',
    'Custom Field',
    'Custom Label',
    'Custom Permission',
    'Permission Set Group',
    'Permission Set',
    'Validation Rule',
    'Sharing Rule',
    'Formula Field',
    'Screen Flow',
    'Record-Triggered Flow',
    'Flow Builder',
    'Process Builder',
    'List View',
    'Related List',
    'Quick Action',
    'Lightning Web Component',
    'Lightning Record Page',
    'Lightning Experience',
    'Platform Event',
    'Named Credential',
    'Connected App',
    'External Client App',
    'Scratch Org',
    'Prompt Builder',
    'Prompt Template',
    'Agent Script',
    'Data Cloud',
    'Experience Cloud',
    'DevOps Center',
    'Salesforce CLI',
    'AppExchange',
    'Agentforce',
    'Visualforce',
    'Trailhead',
    'MuleSoft',
    'OmniStudio',
    'Salesforce',
    'Dreamforce',
    'Einstein',
    'Tableau',
    'Heroku',
    'Slack',
    'Apex',
    'SOQL',
    'SOSL',
    'LWC',
  ],

  houseStyle: [
    'Capitalise Salesforce feature and product names every time they appear, for example: Custom Object, Custom Settings, Custom Metadata Types, Custom Field, Permission Set, Validation Rule, Sharing Rule, Screen Flow, Record-Triggered Flow, Flow Builder, List View, Related List, Quick Action, Lightning Web Component, Platform Event, Named Credential, Connected App, Scratch Org, Prompt Builder, Agentforce, Apex, SOQL.',
    'Ordinary words stay lower case: "a flow of data", "the trigger for the change".',
  ],

  notAuthors: ['salesforce'],

  bot: { name: 'DailyOrgBot', contact: 'https://github.com/Abhinavgithub' },
});
