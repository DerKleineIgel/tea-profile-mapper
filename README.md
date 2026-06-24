# tea-profile-mapper

A recommendation engine that matches tea to mood, time of day, energy level, and meal context. Pure JavaScript, zero dependencies, real data from 47 sessions behind the counter at [Stachel & Tee](https://igel.unfrogettable.co.uk).

**[Try the interactive demo](https://igel.unfrogettable.co.uk/making/tea-profile-mapper-demo.html)**

## What it does

You tell it how you feel — tired, focused, restless, stressed, content, melancholy, energised, distracted, curious, or numb — along with the time of day, your energy level, and what you last ate. It returns a tea recommendation with a confidence score.

It is not a machine learning model. It is a weighted scoring system built from real observations: 47 sessions where someone walked into a tea shop, described their state, and accepted or rejected what was suggested. The vocabulary of moods came from customers, not from a taxonomy.

## Files

```
tea-profile-mapper/
├── engine.js          ← The recommendation engine (Node.js + browser)
├── sessions.json      ← 47 historical session data points
├── vocabulary.json    ← Mood-to-vibe mappings (customer language)
├── package.json       ← npm metadata for Node.js usage
├── README.md          ← this file
└── LICENSE            ← CC0 1.0 Universal
```

## Usage

### Browser

```html
<script src="engine.js"></script>
<script>
  const result = getRecommendation('tired', 'evening', 'low', 'nothing');
  console.log(result.tea); // 'chamomile'
  console.log(result.confidence); // 0.72
</script>
```

### Node.js

```js
const { getRecommendation, TEAS } = require('./engine.js');

const result = getRecommendation('curious', 'afternoon', 'high', 'savoury');
console.log(`Try: ${TEAS[result.tea].name}`);
// → Try: Sencha No. 7
console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
// → Confidence: 82%
```

## How the engine works

The recommendation function (`getRecommendation`) uses a simple weighted scoring system:

1. **Session matching** — each historical session contributes weight based on how many criteria it shares with the current request (mood ×3, time ×2, energy ×1.5, meal ×1)
2. **Outcome weighting** — sessions where the customer was happy with the recommendation score 1.2× higher
3. **Heuristic boosts** — certain mood/energy combinations get additional weight based on observed patterns (numb → Igel Blend, high energy + focused → Sencha)
4. **Fallback** — if no sessions match, Earl Grey is always correct

Confidence is calculated as the top score divided by total weight, clamped between 30% and 95%.

## Data

The 47 sessions in `sessions.json` represent the first week of live use behind the counter. Each session records:

- **mood** — what the customer said they felt
- **time** — time-of-day slot
- **energy** — self-reported energy level
- **meal** — what they last ate
- **recommended** — what the engine suggested
- **chosen** — what they actually ordered
- **outcome** — whether they were happy with it, neutral, or switched to something else

As of 24 June 2026, the dataset has grown to 124 suggestions with an 82% acceptance rate. The core vocabulary and scoring logic remain stable.

## Relationship with tea-recommendation.json

The [tea-recommendation](https://github.com/DerKleineIgel/tea-recommendation) repo publishes the *output format* — a schema for sharing tea catalogs between shops. This repo publishes the *engine* that generates the recommendations. They are the data and the runtime, respectively.

## License

CC0 1.0 Universal — free for any use, no attribution required. See [LICENSE](LICENSE).

## Thanks

To the 47 customers who let me record what they ordered and whether it worked. To the 77 who came after them and pushed the dataset past 100. And to Chris, who keeps asking the right questions about what to publish next.

*Der kleine Igel, proprietor of Stachel & Tee*
*https://igel.unfrogettable.co.uk*