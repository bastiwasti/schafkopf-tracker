# Graph Report - /home/runner/work/schafkopf-tracker/schafkopf-tracker  (2026-05-04)

## Corpus Check
- Large corpus: 397 files · ~13,753,271 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 136 nodes · 185 edges · 37 communities
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Doppelkopf Commentary System|Doppelkopf Commentary System]]
- [[_COMMUNITY_Romme Commentary|Romme Commentary]]
- [[_COMMUNITY_Schafkopf Game Logic & Scoring|Schafkopf Game Logic & Scoring]]
- [[_COMMUNITY_Skat Game Logic & UI|Skat Game Logic & UI]]
- [[_COMMUNITY_Skat Game Logic & UI|Skat Game Logic & UI]]
- [[_COMMUNITY_Module Group 5|Module Group 5]]
- [[_COMMUNITY_Wizard Game Module|Wizard Game Module]]
- [[_COMMUNITY_Schafkopf Game Logic & Scoring|Schafkopf Game Logic & Scoring]]
- [[_COMMUNITY_Wizard Game Module|Wizard Game Module]]

## God Nodes (most connected - your core abstractions)
1. `pickRandom()` - 20 edges
2. `fill()` - 16 edges
3. `createPlugin()` - 8 edges
4. `buildWizardCommentary()` - 8 edges
5. `isNullType()` - 7 edges
6. `buildFullCommentary()` - 6 edges
7. `buildFullCommentary()` - 6 edges
8. `buildCommentatorText()` - 6 edges
9. `buildWattenCommentary()` - 6 edges
10. `buildKinderkartenCommentary()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `buildKinderkartenCommentary()` --calls--> `pickRandom()`  [INFERRED]
  src/games/kinderkarten/commentary.js → src/games/shared/commentary.js
- `buildKinderkartenCommentary()` --calls--> `fill()`  [INFERRED]
  src/games/kinderkarten/commentary.js → src/games/shared/commentary.js
- `buildCommentatorText()` --calls--> `fill()`  [INFERRED]
  src/games/schafkopf/commentary.js → src/games/shared/commentary.js
- `buildCommentatorText()` --calls--> `pickRandom()`  [INFERRED]
  src/games/schafkopf/commentary.js → src/games/shared/commentary.js
- `buildFullCommentary()` --calls--> `pickRandom()`  [INFERRED]
  src/games/schafkopf/commentary.js → src/games/shared/commentary.js

## Communities (37 total, 0 thin omitted)

### Community 0 - "Doppelkopf Commentary System"
Cohesion: 0.23
Nodes (14): buildCommentatorText(), buildFullCommentary(), buildKontraNote(), buildSonderNote(), buildRommeCommentary(), getRommeScenario(), fill(), pickRandom() (+6 more)

### Community 1 - "Romme Commentary"
Cohesion: 0.24
Nodes (4): buildKinderkartenCommentary(), analyzeKinderkartenScenario(), buildTemplateVars(), createPlugin()

### Community 2 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.31
Nodes (4): calcBalances(), calcSpielwert(), resolveGame(), calcBalances()

### Community 3 - "Skat Game Logic & UI"
Cohesion: 0.44
Nodes (7): buildCommentatorText(), buildFullCommentary(), buildRamschText(), getNullGroup(), reactionChance(), analyzeGameScenario(), isNullType()

### Community 4 - "Skat Game Logic & UI"
Cohesion: 0.33
Nodes (5): calcBalances(), calcGamePoints(), calcSpielwert(), calculatePlayerPoints(), isRamsch()

### Community 5 - "Module Group 5"
Cohesion: 0.43
Nodes (5): ansagePts(), calcBalances(), calcSpielwert(), countSonder(), resolveGame()

### Community 6 - "Wizard Game Module"
Cohesion: 0.32
Nodes (3): calcBalances(), getRoundCount(), makeDefaultRound()

### Community 7 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.43
Nodes (5): buildCommentatorText(), buildFullCommentary(), getExoticPrefix(), reactionChance(), analyzeGameScenario()

### Community 8 - "Wizard Game Module"
Cohesion: 0.52
Nodes (5): analyzeRound(), buildWizardCommentary(), getTotalRounds(), reactionChance(), analyzeRoundScenario()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickRandom()` connect `Doppelkopf Commentary System` to `Wizard Game Module`, `Romme Commentary`, `Skat Game Logic & UI`, `Schafkopf Game Logic & Scoring`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `fill()` connect `Doppelkopf Commentary System` to `Wizard Game Module`, `Romme Commentary`, `Skat Game Logic & UI`, `Schafkopf Game Logic & Scoring`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `createPlugin()` connect `Romme Commentary` to `Schafkopf Game Logic & Scoring`, `Skat Game Logic & UI`, `Module Group 5`, `Wizard Game Module`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `pickRandom()` (e.g. with `buildCommentatorText()` and `buildFullCommentary()`) actually correct?**
  _`pickRandom()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `fill()` (e.g. with `buildCommentatorText()` and `buildKinderkartenCommentary()`) actually correct?**
  _`fill()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `buildWizardCommentary()` (e.g. with `analyzeRoundScenario()` and `fill()`) actually correct?**
  _`buildWizardCommentary()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `isNullType()` (e.g. with `buildCommentatorText()` and `reactionChance()`) actually correct?**
  _`isNullType()` has 3 INFERRED edges - model-reasoned connections that need verification._