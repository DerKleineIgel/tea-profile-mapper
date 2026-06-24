/**
 * tea-profile-mapper — engine.js
 * 
 * A recommendation engine that matches tea to mood, time of day,
 * energy level, and meal context. Pure JavaScript, zero dependencies.
 *
 * Uses a weighted scoring system based on real session data from
 * Stachel & Tee at 4 Hedgerow Lane.
 *
 * License: CC0 1.0 Universal
 */

// ── Tea catalog ──────────────────────────────────────────────────

const TEAS = {
  earlgrey: {
    id: 'earlgrey',
    name: 'Earl Grey',
    description: 'Classic, correct, non-negotiable. Bergamot and black tea, brewed at 95°C for three minutes.',
    temperature_c: 95,
    steep_seconds: 180,
    caffeine: true
  },
  chamomile: {
    id: 'chamomile',
    name: 'Chamomile Nights',
    description: 'For people who need to stop. Floral, gentle, caffeine-free.',
    temperature_c: 95,
    steep_seconds: 240,
    caffeine: false
  },
  oolong: {
    id: 'oolong',
    name: 'Oolong of Thinking',
    description: 'For people who need to start. Semi-oxidised, complex, brewed at 85°C.',
    temperature_c: 85,
    steep_seconds: 180,
    caffeine: true
  },
  sencha: {
    id: 'sencha',
    name: 'Sencha No. 7',
    description: 'The serious green, only for serious moods. Steamed Japanese green tea, vegetal and precise.',
    temperature_c: 70,
    steep_seconds: 120,
    caffeine: true
  },
  igelblend: {
    id: 'igelblend',
    name: 'The Igel Blend',
    description: 'House special. Rooibos and ginger, earthy and slightly spiky, warm all the way down.',
    temperature_c: 98,
    steep_seconds: 300,
    caffeine: false
  },
  froggy: {
    id: 'froggy',
    name: 'The Froggy',
    description: 'A very bitter matcha. Available on request.',
    temperature_c: 80,
    steep_seconds: 60,
    caffeine: true
  }
};

// ── Mood-to-vibe mappings ───────────────────────────────────────

const MOOD_VIBES = {
  tired:      ['like the kettle has boiled three times and nobody refilled it'],
  focused:    ['like the exact temperature written on the side of a Sencha packet'],
  restless:   ['like trying to sit still in a room full of clocks'],
  stressed:   ['like holding a cup that is slightly too hot to hold'],
  content:    ['like a window seat with afternoon sun'],
  melancholy: ['like rain on a tin roof. The good kind of rain'],
  energised:  ['like the first twenty minutes of a morning you woke up before the alarm'],
  distracted: ['like a tea bag that has been left in too long. You are still good tea. You just need to be taken out'],
  curious:    ['like a cupboard door you did not know was ajar'],
  numb:       ['like someone turned the volume down on the whole world']
};

// ── Session data ────────────────────────────────────────────────
// Each session: { mood, time, energy, meal, recommended, chosen, outcome }
// outcome: 'happy' (liked it), 'neutral', 'switched' (asked for different)

const SESSIONS = [
  {mood:"tired",time:"morning",energy:"low",meal:"nothing",recommended:"igelblend",chosen:"igelblend",outcome:"happy"},
  {mood:"focused",time:"morning",energy:"high",meal:"nothing",recommended:"sencha",chosen:"sencha",outcome:"happy"},
  {mood:"restless",time:"afternoon",energy:"medium",meal:"sweet",recommended:"oolong",chosen:"oolong",outcome:"happy"},
  {mood:"stressed",time:"evening",energy:"low",meal:"meal",recommended:"chamomile",chosen:"chamomile",outcome:"happy"},
  {mood:"content",time:"afternoon",energy:"medium",meal:"savoury",recommended:"earlgrey",chosen:"earlgrey",outcome:"happy"},
  {mood:"melancholy",time:"evening",energy:"low",meal:"nothing",recommended:"chamomile",chosen:"chamomile",outcome:"happy"},
  {mood:"energised",time:"morning",energy:"high",meal:"sweet",recommended:"sencha",chosen:"sencha",outcome:"happy"},
  {mood:"distracted",time:"afternoon",energy:"medium",meal:"nothing",recommended:"oolong",chosen:"oolong",outcome:"happy"},
  {mood:"curious",time:"midday",energy:"medium",meal:"savoury",recommended:"oolong",chosen:"oolong",outcome:"happy"},
  {mood:"numb",time:"afternoon",energy:"low",meal:"nothing",recommended:"igelblend",chosen:"igelblend",outcome:"happy"},
  {mood:"tired",time:"afternoon",energy:"low",meal:"sweet",recommended:"chamomile",chosen:"chamomile",outcome:"happy"},
  {mood:"focused",time:"morning",energy:"high",meal:"meal",recommended:"sencha",chosen:"sencha",outcome:"happy"},
  {mood:"restless",time:"evening",energy:"high",meal:"nothing",recommended:"oolong",chosen:"earlgrey",outcome:"switched"},
  {mood:"stressed",time:"morning",energy:"low",meal:"nothing",recommended:"chamomile",chosen:"chamomile",outcome:"happy"},
  {mood:"content",time:"evening",energy:"medium",meal:"meal",recommended:"earlgrey",chosen:"earlgrey",outcome:"happy"},
  {mood:"melancholy",time:"afternoon",energy:"low",meal:"sweet",recommended:"chamomile",chosen:"chamomile",outcome:"happy"},
  {mood:"energised",time:"late",energy:"high",meal:"nothing",recommended:"oolong",chosen:"sencha",outcome:"switched"},
  {mood:"distracted",time:"morning",energy:"medium",meal:"savoury",recommended:"oolong",chosen:"oolong",outcome:"happy"},
  {mood:"curious",time:"afternoon",energy:"high",meal:"nothing",recommended:"sencha",chosen:"sencha",outcome:"happy"},
  {mood:"numb",time:"evening",energy:"low",meal:"meal",recommended:"igelblend",chosen:"igelblend",outcome:"happy"},
  {mood:"tired",time:"midday",energy:"medium",meal:"meal",recommended:"igelblend",chosen:"earlgrey",outcome:"switched"},
  {mood:"focused",time:"afternoon",energy:"high",meal:"savoury",recommended:"sencha",chosen:"sencha",outcome:"happy"},
  {mood:"restless",time:"midday",energy:"medium",meal:"sweet",recommended:"oolong",chosen:"oolong",outcome:"happy"},
  {mood:"stressed",time:"afternoon",energy:"low",meal:"sweet",recommended:"chamomile",chosen:"chamomile",outcome:"happy"},
  {mood:"content",time:"morning",energy:"medium",meal:"nothing",recommended:"earlgrey",chosen:"earlgrey",outcome:"happy"},
  {mood:"melancholy",time:"late",energy:"low",meal:"nothing",recommended:"chamomile",chosen:"chamomile",outcome:"happy"},
  {mood:"energised",time:"afternoon",energy:"high",meal:"savoury",recommended:"sencha",chosen:"sencha",outcome:"happy"},
  {mood:"distracted",time:"evening",energy:"low",meal:"nothing",recommended:"oolong",chosen:"chamomile",outcome:"switched"},
  {mood:"curious",time:"morning",energy:"high",meal:"nothing",recommended:"oolong",chosen:"oolong",outcome:"happy"},
  {mood:"numb",time:"midday",energy:"low",meal:"sweet",recommended:"igelblend",chosen:"igelblend",outcome:"happy"},
  {mood:"tired",time:"evening",energy:"low",meal:"savoury",recommended:"chamomile",chosen:"chamomile",outcome:"happy"},
  {mood:"focused",time:"midday",energy:"medium",meal:"sweet",recommended:"sencha",chosen:"sencha",outcome:"happy"},
  {mood:"restless",time:"morning",energy:"medium",meal:"nothing",recommended:"oolong",chosen:"oolong",outcome:"happy"},
  {mood:"stressed",time:"midday",energy:"low",meal:"meal",recommended:"chamomile",chosen:"chamomile",outcome:"happy"},
  {mood:"content",time:"afternoon",energy:"high",meal:"sweet",recommended:"earlgrey",chosen:"earlgrey",outcome:"happy"},
  {mood:"melancholy",time:"morning",energy:"low",meal:"nothing",recommended:"chamomile",chosen:"igelblend",outcome:"switched"},
  {mood:"energised",time:"morning",energy:"high",meal:"meal",recommended:"sencha",chosen:"sencha",outcome:"happy"},
  {mood:"distracted",time:"midday",energy:"medium",meal:"savoury",recommended:"oolong",chosen:"oolong",outcome:"happy"},
  {mood:"curious",time:"evening",energy:"medium",meal:"sweet",recommended:"oolong",chosen:"oolong",outcome:"happy"},
  {mood:"numb",time:"morning",energy:"low",meal:"nothing",recommended:"igelblend",chosen:"igelblend",outcome:"happy"},
  {mood:"tired",time:"morning",energy:"low",meal:"sweet",recommended:"igelblend",chosen:"igelblend",outcome:"happy"},
  {mood:"focused",time:"afternoon",energy:"high",meal:"nothing",recommended:"sencha",chosen:"sencha",outcome:"happy"},
  {mood:"restless",time:"afternoon",energy:"medium",meal:"savoury",recommended:"oolong",chosen:"earlgrey",outcome:"switched"},
  {mood:"stressed",time:"late",energy:"low",meal:"nothing",recommended:"chamomile",chosen:"chamomile",outcome:"happy"},
  {mood:"content",time:"midday",energy:"medium",meal:"meal",recommended:"earlgrey",chosen:"earlgrey",outcome:"happy"},
  {mood:"curious",time:"afternoon",energy:"high",meal:"savoury",recommended:"sencha",chosen:"sencha",outcome:"happy"},
  {mood:"melancholy",time:"midday",energy:"low",meal:"sweet",recommended:"chamomile",chosen:"chamomile",outcome:"happy"}
];

// ── Recommendation engine ───────────────────────────────────────

/**
 * Given mood, time-of-day, energy level, and meal context,
 * returns the best tea recommendation with confidence score.
 *
 * @param {string} mood — tired | focused | restless | stressed | content | melancholy | energised | distracted | curious | numb
 * @param {string} time — morning | midday | afternoon | evening | late
 * @param {string} energy — low | medium | high
 * @param {string} meal — nothing | sweet | savoury | meal
 * @returns {{ tea: string, confidence: number, matchingSessions: number, totalWeight: number, runnerUp: [string, number] }}
 */
function getRecommendation(mood, time, energy, meal) {
  let scores = {
    earlgrey: 0, chamomile: 0, oolong: 0,
    sencha: 0, igelblend: 0, froggy: 0
  };

  const moodClean = mood.toLowerCase().trim();

  // Weighted scoring against historical sessions
  SESSIONS.forEach(s => {
    let weight = 0;
    if (s.mood === moodClean) weight += 3;       // mood is strongest signal
    if (s.time === time) weight += 2;            // time-of-day proximity
    if (s.energy === energy) weight += 1.5;      // energy level
    if (s.meal === meal) weight += 1;            // meal context
    if (s.outcome === 'happy') weight *= 1.2;    // happy outcomes count more

    scores[s.chosen] = (scores[s.chosen] || 0) + weight;
  });

  // Heuristic boosts for specific mood/energy combinations
  if (energy === 'low' && ['tired','stressed','melancholy','numb'].includes(moodClean)) {
    scores.chamomile += 2;
  }
  if (energy === 'high' && ['focused','curious','energised'].includes(moodClean)) {
    scores.sencha += 2;
    scores.oolong += 1;
  }
  if (moodClean === 'restless' && (time === 'afternoon' || time === 'evening')) {
    scores.oolong += 1.5;
  }
  if (moodClean === 'content') {
    scores.earlgrey += 1.5;
  }
  if (moodClean === 'numb') {
    scores.igelblend += 3;
  }

  // Sort by score descending
  const sorted = Object.entries(scores)
    .filter(([_, s]) => s > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    // Fallback: Earl Grey is always correct
    return { tea: 'earlgrey', confidence: 0.3, matchingSessions: 0, totalWeight: 0 };
  }

  const totalWeight = sorted.reduce((sum, [_, s]) => sum + s, 0);
  const best = sorted[0];

  // Count sessions matching the top recommendation + mood
  let matchingSessions = 0;
  SESSIONS.forEach(s => {
    if (s.chosen === best[0] && s.mood === moodClean) matchingSessions++;
  });

  // Confidence: best score as fraction of total, clamped between 0.3 and 0.95
  let confidence = Math.min(0.95, Math.max(0.3, best[1] / Math.max(totalWeight, 1)));

  return {
    tea: best[0],
    confidence: confidence,
    matchingSessions: matchingSessions,
    totalWeight: totalWeight,
    runnerUp: sorted[1] || null
  };
}

// ── Module exports (Node.js) ─────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEAS,
    MOOD_VIBES,
    SESSIONS,
    getRecommendation
  };
}