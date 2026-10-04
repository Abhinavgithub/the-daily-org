import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PAPER } from './testing';
import { applyGlossary as applyGlossaryFor, sentenceCase } from './style';

// The tests' own paper, not the one this project publishes.
const applyGlossary = (text: string) => applyGlossaryFor(text, PAPER);

test('the glossary fixes Salesforce terms and leaves ordinary words alone', () => {
  assert.equal(
    applyGlossary('unlike records in a custom object or Custom Settings'),
    'unlike records in a Custom Object or Custom Settings',
  );
  assert.equal(applyGlossary('custom metadata types and custom metadata'), 'Custom Metadata Types and Custom Metadata');
  assert.equal(applyGlossary('permission sets, a permission set group'), 'Permission Sets, a Permission Set Group');
  assert.equal(applyGlossary('soql in apex, and an lwc'), 'SOQL in Apex, and an LWC');
  assert.equal(applyGlossary('a record triggered flow and a screen flow'), 'a Record-Triggered Flow and a Screen Flow');
  assert.equal(applyGlossary('lightning web components'), 'Lightning Web Components');
  // Ordinary English and identifiers are untouched.
  const plain = 'The flow of data and the trigger for the change. Deal_Policy__mdt, apex-class, MyApexHelper.';
  assert.equal(applyGlossary(plain), plain);
  assert.equal(applyGlossary(applyGlossary('custom objects')), 'Custom Objects', 'idempotent');
});

test('headlines are put in sentence case, keeping proper nouns', () => {
  const context = 'The team behind Cloud Atlas replaced the limits. It runs on Salesforce and uses AIforce.';
  assert.equal(
    sentenceCase('Cloud Atlas Replaces Per-Instance Rate Limits With Fleet-Wide Protection', context),
    'Cloud Atlas replaces per-instance rate limits with fleet-wide protection',
  );
  assert.equal(
    applyGlossary(sentenceCase('Custom Metadata Types as One Deployable Home for Values Across Salesforce', context)),
    'Custom Metadata Types as one deployable home for values across Salesforce',
  );
  assert.equal(
    applyGlossary(sentenceCase('Custom Metadata Types as One Home for Values Across Salesforce and Slack', '')),
    'Custom Metadata Types as one home for values across Salesforce and Slack',
    'brand names are restored by the glossary even when the story text never mentions them',
  );
  assert.equal(sentenceCase('Inside AIforce: How SOQL Limits Shape DevOps Center', context), 'Inside AIforce: How SOQL limits shape DevOps center');
  const already = 'Agent Designer automates multi-agent AI team design and repair';
  assert.equal(sentenceCase(already, context), already);
});
