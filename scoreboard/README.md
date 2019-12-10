# To use

- Include the CSS and JS links that are included in `index.html`.
- There must be an HTML element with `id=scoreboard`; this will be where the scoreboard will go. 
- Call `initScoreboard()` in javascript to initialize the scoreboard.
- Feel free to modify the markup outside of `#scoreboard`.
- Feel free to modify the styling of the page.

`initScoreboard` accepts an optional param `options`, which can have the following attributes:

- `demo`: if `true`, then a demo scoreboard will be displayed instead of an actual scoreboard.

(so far, that's the only option available, haha)

More options are passed as URL params: `?option1=value1&option2=value2...`

## For displaying the scoreboard of one-off contests

- `source`: either `CF` (Codeforces) or `HR` (HackerRank)
- `past`: comma-separated list of contest codes to fetch data once (but not update). Use for finished contests.
- `fetch`: comma-separated list of contest codes fo fetch data at regular intervals. Use for running contests.

For HackerRank contests, contest codes are the slugs found in the URL, i.e., the `XXX` in `hackerrank.com/contests/XXX/challenges`.  

For Codeforces contests, contest codes can be anything, but you also need to pass another param, `ids`, which is a comma-separated list of Codeforces contest IDs. It must be that `|ids| = |past| + |fetch|`, and that `ids` correspond to `past + fetch` in that order, respectively.

The contest ID is the number in the URL, NOT the Codeforces round number, i.e., `XXX` in `codeforces.com/contest/XXX`.

## For displaying the scoreboard of NOI.PH contests

- `contest`: One of `noielims`, `noifinalspractice`, `noifinals1`, `noifinals2`, `noiteam`. 
- `year`: So far, it can be anything from `2014` to the current year.

This sets `source`, `past`, `fetch`, and some extra options accordingly, depending on the contest.

## Extra options

- `type`: One of `noielims`, `noielims2016`, `noifinals2019`, `noifinals`, `noiteam`, `generic`. Sets the cutoffs/colors of ranks for awards, medals, qualification thresholds, etc, e.g., `noielims` will highlight the top 30 since they will qualify as finalists.
- `nohilit`: If `1`, hovering the mouse over a row doesn't highlight it. Use for display/projection purposes, e.g., when projecting the scoreboard on the screen for coaches.
- `pd`: (penalty digits), minimum number of decimal points to display for the time penalty.
- `td`: (total score digits), minimum number of decimal points to display for the total score.
- `sd`: (score digits), minimum number of decimal points to display for the score.
- `blanks`: Show a slightly different color to distinguish attempts with 0 points and no attempts.
