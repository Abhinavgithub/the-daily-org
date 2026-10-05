import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PAPER } from './testing';
import { applyGlossary as applyGlossaryFor, sentenceCase } from './style';

// The tests' own paper, not the one this project publishes.
const applyGlossary = (text: string) => applyGlossaryFor(text, PAPER);

test('the glossary fixes the terms of the paper and leaves ordinary words alone', () => {
  assert.equal(
    applyGlossary('unlike wagons in a goods yard or Branch Lines'),
    'unlike wagons in a Goods Yard or Branch Lines',
  );
  assert.equal(applyGlossary('signal box diagrams and a signal box'), 'Signal Box Diagrams and a Signal Box');
  assert.equal(applyGlossary('track circuits, a track circuit board'), 'Track Circuits, a Track Circuit Board');
  assert.equal(applyGlossary('etcs on eurostar, and a tgv'), 'ETCS on Eurostar, and a TGV');
  assert.equal(applyGlossary('a narrow gauge line and a main line'), 'a Narrow-Gauge Line and a Main Line');
  assert.equal(applyGlossary('diesel multiple units'), 'Diesel Multiple Units');
  // Ordinary English and identifiers are untouched.
  const plain = 'The line of people and the signal for the change. Yard_Plan__v2, eurostar-class, MyEurostarHelper.';
  assert.equal(applyGlossary(plain), plain);
  assert.equal(applyGlossary(applyGlossary('goods yards')), 'Goods Yards', 'idempotent');
});

test('headlines are put in sentence case, keeping proper nouns', () => {
  const context = 'The team behind Track Atlas replaced the limits. It runs on Eurostar and uses RailLab.';
  assert.equal(
    sentenceCase('Track Atlas Replaces Per-Train Speed Limits With Fleet-Wide Protection', context),
    'Track Atlas replaces per-train speed limits with fleet-wide protection',
  );
  assert.equal(
    applyGlossary(sentenceCase('Signal Box Diagrams as One Shared Home for Routes Across Eurostar', context)),
    'Signal Box Diagrams as one shared home for routes across Eurostar',
  );
  assert.equal(
    applyGlossary(sentenceCase('Signal Box Diagrams as One Home for Routes Across Eurostar and Amtrak', '')),
    'Signal Box Diagrams as one home for routes across Eurostar and Amtrak',
    'brand names are restored by the glossary even when the story text never mentions them',
  );
  assert.equal(sentenceCase('Inside RailLab: How ETCS Limits Shape RailOps Center', context), 'Inside RailLab: How ETCS limits shape RailOps center');
  const already = 'Route Designer automates multi-train AI timetable design and repair';
  assert.equal(sentenceCase(already, context), already);
});
