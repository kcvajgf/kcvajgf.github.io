// by Kevin Atienza

/////////////// fake data
var xdata = {
    problems: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
    contestants: [
        {
            name: "Team X",
            rank: 1, score: 2, attempts: 3, penalty: 100,
            subs: {
                "A": { score: 1, attempts: 1, penalty: 30 },
                "B": { score: 1, attempts: 2, penalty: 50 },
                "C": { score: 0, attempts: 0, penalty: 0 },
                "D": { score: 0, attempts: 0, penalty: 0 },
                "E": { score: 0, attempts: 0, penalty: 0 },
                "F": { score: 0, attempts: 0, penalty: 0 },
                "G": { score: 0, attempts: 0, penalty: 0 },
                "H": { score: 0, attempts: 0, penalty: 0 },
                "I": { score: 0, attempts: 0, penalty: 0 },
                "J": { score: 0, attempts: 0, penalty: 0 },
                "K": { score: 0, attempts: 0, penalty: 0 },
                "L": { score: 0, attempts: 0, penalty: 0 },
                "M": { score: 0, attempts: 0, penalty: 0 },
            },
        },
        {
            name: "Team Y",
            rank: 2, score: 2, attempts: 4, penalty: 110,
            subs: {
                "A": { score: 1, attempts: 2, penalty: 30 },
                "B": { score: 1, attempts: 2, penalty: 40 },
                "C": { score: 0, attempts: 0, penalty: 0 },
                "D": { score: 0, attempts: 0, penalty: 0 },
                "E": { score: 0, attempts: 0, penalty: 0 },
                "F": { score: 0, attempts: 0, penalty: 0 },
                "G": { score: 0, attempts: 0, penalty: 0 },
                "H": { score: 0, attempts: 0, penalty: 0 },
                "I": { score: 0, attempts: 0, penalty: 0 },
                "J": { score: 0, attempts: 0, penalty: 0 },
                "K": { score: 0, attempts: 0, penalty: 0 },
                "L": { score: 0, attempts: 0, penalty: 0 },
                "M": { score: 0, attempts: 0, penalty: 0 },
            },
        },
        {
            name: "Team A",
            rank: 3, score: 1, attempts: 3, penalty: 70,
            subs: {
                "A": { score: 1, attempts: 3, penalty: 30 },
                "B": { score: 0, attempts: 0, penalty: 0 },
                "C": { score: 0, attempts: 0, penalty: 0 },
                "D": { score: 0, attempts: 0, penalty: 0 },
                "E": { score: 0, attempts: 0, penalty: 0 },
                "F": { score: 0, attempts: 0, penalty: 0 },
                "G": { score: 0, attempts: 0, penalty: 0 },
                "H": { score: 0, attempts: 0, penalty: 0 },
                "I": { score: 0, attempts: 0, penalty: 0 },
                "J": { score: 0, attempts: 0, penalty: 0 },
                "K": { score: 0, attempts: 0, penalty: 0 },
                "L": { score: 0, attempts: 0, penalty: 0 },
                "M": { score: 0, attempts: 0, penalty: 0 },
            },
        },
        {
            name: "Team B",
            rank: 3, score: 1, attempts: 4, penalty: 70,
            subs: {
                "A": { score: 0, attempts: 2, penalty: 0 },
                "B": { score: 1, attempts: 2, penalty: 50 },
                "C": { score: 0, attempts: 0, penalty: 0 },
                "D": { score: 0, attempts: 0, penalty: 0 },
                "E": { score: 0, attempts: 0, penalty: 0 },
                "F": { score: 0, attempts: 0, penalty: 0 },
                "G": { score: 0, attempts: 0, penalty: 0 },
                "H": { score: 0, attempts: 0, penalty: 0 },
                "I": { score: 0, attempts: 0, penalty: 0 },
                "J": { score: 0, attempts: 0, penalty: 0 },
                "K": { score: 0, attempts: 0, penalty: 0 },
                "L": { score: 0, attempts: 0, penalty: 0 },
                "M": { score: 0, attempts: 0, penalty: 0 },
            },
        },
        {
            name: "Team C",
            rank: 5, score: 1, attempts: 1, penalty: 71,
            subs: {
                "A": { score: 0, attempts: 0, penalty: 0 },
                "B": { score: 1, attempts: 1, penalty: 71 },
                "C": { score: 0, attempts: 0, penalty: 0 },
                "D": { score: 0, attempts: 0, penalty: 0 },
                "E": { score: 0, attempts: 0, penalty: 0 },
                "F": { score: 0, attempts: 0, penalty: 0 },
                "G": { score: 0, attempts: 0, penalty: 0 },
                "H": { score: 0, attempts: 0, penalty: 0 },
                "I": { score: 0, attempts: 0, penalty: 0 },
                "J": { score: 0, attempts: 0, penalty: 0 },
                "K": { score: 0, attempts: 0, penalty: 0 },
                "L": { score: 0, attempts: 0, penalty: 0 },
                "M": { score: 0, attempts: 0, penalty: 0 },
            },
        },
        {
            name: "Team LOL",
            rank: 6, score: 0, attempts: 11, penalty: 0,
            subs: {
                "A": { score: 0, attempts: 5, penalty: 0 },
                "B": { score: 0, attempts: 6, penalty: 0 },
                "C": { score: 0, attempts: 0, penalty: 0 },
                "D": { score: 0, attempts: 0, penalty: 0 },
                "E": { score: 0, attempts: 0, penalty: 0 },
                "F": { score: 0, attempts: 0, penalty: 0 },
                "G": { score: 0, attempts: 0, penalty: 0 },
                "H": { score: 0, attempts: 0, penalty: 0 },
                "I": { score: 0, attempts: 0, penalty: 0 },
                "J": { score: 0, attempts: 0, penalty: 0 },
                "K": { score: 0, attempts: 0, penalty: 0 },
                "L": { score: 0, attempts: 0, penalty: 0 },
                "M": { score: 0, attempts: 0, penalty: 0 },
            },
        },
        {
            name: "Team LAL",
            rank: 6, score: 0, attempts: 24, penalty: 0,
            subs: {
                "A": { score: 0, attempts: 0, penalty: 0 },
                "B": { score: 0, attempts: 0, penalty: 0 },
                "C": { score: 0, attempts: 0, penalty: 0 },
                "D": { score: 0, attempts: 0, penalty: 0 },
                "E": { score: 0, attempts: 1, penalty: 0 },
                "F": { score: 0, attempts: 1, penalty: 0 },
                "G": { score: 0, attempts: 11, penalty: 0 },
                "H": { score: 0, attempts: 11, penalty: 0 },
                "I": { score: 0, attempts: 0, penalty: 0 },
                "J": { score: 0, attempts: 0, penalty: 0 },
                "K": { score: 0, attempts: 0, penalty: 0 },
                "L": { score: 0, attempts: 0, penalty: 0 },
                "M": { score: 0, attempts: 0, penalty: 0 },
            },
        },
        {
            name: "Team LEL",
            rank: 6, score: 0, attempts: 1, penalty: 0,
            subs: {
                "A": { score: 0, attempts: 0, penalty: 0 },
                "B": { score: 0, attempts: 0, penalty: 0 },
                "C": { score: 0, attempts: 0, penalty: 0 },
                "D": { score: 0, attempts: 0, penalty: 0 },
                "E": { score: 0, attempts: 1, penalty: 0 },
                "F": { score: 0, attempts: 0, penalty: 0 },
                "G": { score: 0, attempts: 0, penalty: 0 },
                "H": { score: 0, attempts: 0, penalty: 0 },
                "I": { score: 0, attempts: 0, penalty: 0 },
                "J": { score: 0, attempts: 0, penalty: 0 },
                "K": { score: 0, attempts: 0, penalty: 0 },
                "L": { score: 0, attempts: 0, penalty: 0 },
                "M": { score: 0, attempts: 0, penalty: 0 },
            },
        },
    ]
};

var sc = 0.7;
var xattprobs = {
    "A": 0.11*sc,
    "B": 0.03*sc,
    "C": 0.01*sc,
    "D": 0.01*sc,
    "E": 0.01*sc,
    "F": 0.05*sc,
    "G": 0.01*sc,
    "H": 0.01*sc,
    "I": 0.005*sc,
    "J": 0.01*sc,
    "K": 0.01*sc,
    "L": 0.11*sc,
    "M": 0.21*sc,
};
var xsolprobs = {
    "A": 0.9,
    "B": 0.4,
    "C": 0.7,
    "D": 0.7,
    "E": 0.7,
    "F": 0.1,
    "G": 0.9,
    "H": 0.7,
    "I": 0.1,
    "J": 0.9,
    "K": 0.3,
    "L": 0.1,
    "M": 0.01,
};

var xtskill = {
    "Team X": 11.0,
    "Team Y": 5.0,
    "Team A": 3.0,
    "Team B": 0.1,
    "Team C": 1.0,
    "Team LOL": 20.0,
    "Team LAL": 0.3,
    "Team LEL": 1.0,
}

var xpen = 0, xguys = 0;
async function fetchData(source) {
    // increase penalty a little bit
    xpen++;
    while (Math.random() < 0.1) xpen++;

    var trySolving = function(c) {
        var done = 0;
        for (const p of xdata.problems) {
            if (Math.random() < xattprobs[p] && c.subs[p].score == 0) {
                done++;
                console.log("make attempt");
                // make attempt
                c.subs[p].attempts++;
                c.attempts++;
                if (Math.random() < xtskill[c.name] * xsolprobs[p]) {
                    // correct answer. add penalty
                    if (c.subs[p].penalty != 0) throw "Invalid data";
                    c.subs[p].penalty = xpen;
                    c.subs[p].score = 1;
                    c.score++;
                    c.penalty += xpen + 20 * (c.subs[p].attempts - 1);
                }
            }
        }
        return done;
    };

    while (Math.random() < 0.2 && xdata.contestants.length < 1111) {
        // new guy
        console.log("new guy");
        var c = {
            name: `new guy ${xguys++}`,
            score: 0,
            attempts: 0,
            penalty: 0,
            subs: {},
        };
        for (const p of xdata.problems) {
            c.subs[p] = { score: 0, attempts: 0, penalty: 0 };
        }
        while (!trySolving(c));
        xdata.contestants.push(c);
        xtskill[c.name] = 0.01 + 50.0 * Math.random() * Math.random();
    }

    for (const c of xdata.contestants) trySolving(c);

    // sort
    xdata.contestants.sort(function(x, y) {
        if (x.score != y.score) return y.score - x.score;
        if (x.penalty != y.penalty) return x.penalty - y.penalty;
        return 0;
    });

    // recompute rank
    for (var i = 0, rank = 0; i < xdata.contestants.length; i++) {
        if (i == 0 || xdata.contestants[i - 1].score != xdata.contestants[i].score || 
                xdata.contestants[i - 1].penalty != xdata.contestants[i].penalty) {
            rank = i + 1;
        }
        xdata.contestants[i].rank = rank;
    }

    return Promise.resolve(xdata);
}
///////////// end fake data


rankRuleses = {
    "wf": [
        {rank: 4, color: "#ffd700"},
        {rank: 8, color: "#c0c0c0"},
        {rank: 12, color: "#cd7f32"},
    ],
    "generic": [
        {rank: 1, color: "#ffd700"},
        {rank: 2, color: "#c0c0c0"},
        {rank: 3, color: "#cd7f32"},
    ],
}

var search = new URLSearchParams(window.location.search);

var leaderboardSource = search && search.get("src") ? search.get("src") : "http://localhost:8000";
var nohilit = search && search.get("nohilit") ? parseInt(search.get("nohilit")) : 0;

var rankRules = rankRuleses[search.get("type") || "generic"]
if (!rankRules) {
    alert(`Unknown 'type' ${search.get("type")}.`);
    rankRules = [];
}

var vm = new Vue({
    el: '#leaderboard',
    data: {
        problems: [],
        contestants: [],
        loadedAll: false,
        leaderboardSource,
        rankRules,
        nohilit,
        showAttempts: true,
        showPenalty: true,
        startedFetchLoop: false,
    },
    async mounted() {
        this.$el.classList.add("board-loading");

        await this.initFetchAll();

        setTimeout(() => {
            this.$el.classList.remove("board-loading");
            this.$el.classList.add("board-created");
        }, 1000);

        this.startFetchLoop();
    },
    computed: {
        nameContestant() {
            var nameContestant = {};
            for (const contestant of this.contestants) nameContestant[contestant.name] = contestant;
            return nameContestant;
        },

        maxScore() {
            var maxScore = 1;
            for (const contestant of this.contestants) maxScore = Math.max(maxScore, contestant.score);
            return maxScore;

        },

        maxPenalty() {
            var maxPenalty = 1;
            for (const contestant of this.contestants) maxPenalty = Math.max(maxPenalty, contestant.penalty);
            return maxPenalty;
        },

        maxAttempts() {
            var maxAttempts = 1;
            for (const contestant of this.contestants) maxAttempts = Math.max(maxAttempts, contestant.attempts);
            return maxAttempts;
        },
    },

    methods: {
        async startFetchLoop() {
            console.log("Starting Fetch Loop");

            if (this.startedFetchLoop) {
                console.log("Already started. Ignoring YOU!!!");
                return;
            }
            this.startedFetchLoop = true;

            while (true) {
                await new Promise(resolve => setTimeout(resolve, 7111)); // feels hacky
                await this.fetchAll().catch((e) => {
                    console.log("Got error", e);
                    console.log(`Failed to load data! Never mind. I'll try again later.`)
                });
            }
        },

        async initFetchAll() {
            // load from localStorage
            var allData = localStorage.getItem(this.leaderboardSource);
            if (false) {//allData) {
                console.log(`Loading ${this.leaderboardSource} from local storage`);
                allData = JSON.parse(allData);
                console.log(`Loaded ${this.leaderboardSource}`);
            } else {
                allData = await this.fetchData();
            }
            this.processData(allData);
            this.loadedAll = true;
        },

        async fetchData() {
            console.log(`Fetching ${this.leaderboardSource}`);
            var allData = await fetchData(this.leaderboardSource).catch((x) => {
                console.log("Got error", x);
                console.log(`Failed to fetch data from ${this.leaderboardSource}. Please try again later.`);
            });
            console.log("Done");
            // if (allData) localStorage.setItem(this.leaderboardSource, JSON.stringify(allData));
            return allData;
        },

        async fetchAll(problem) {
            this.processData(await this.fetchData());
        },

        processData(allData) {
            if (allData) {
                this.problems = allData.problems;
                this.contestants = allData.contestants;
            }
        },

        // these are mostly just filter-like things.
        colorForSub(sub) {
            if (sub.pending) {
                return "rgba(80, 80, 255, 0.333)";
            } else if (sub.attempts == 0) {
                return "rgba(255, 255, 255, 0.333)";
            } else if (sub.score == 0) {
                return "rgba(255, 0, 0, 0.333)";
            } else if (sub.score == 1) {
                return "rgba(0, 255, 0, 0.333)";
            } else {
                return "rgba(255, 0, 0, 0.666)";
            }
        },
        subId(sub) {
            return `${sub.score}_${sub.attempts}_${sub.penalty}`;
        },
        contId(cont) {
            return `${cont.score}_${cont.penalty}`;
        },
        colorForTotalScore(score) {
            score /= this.maxScore;
            var rb = Math.round(222 * (1 - (this.maxScore == this.problems.length ? 1.0 : 0.8) * score));
            return `rgba(${rb}, 222, ${rb}, 0.5)`;
        },
        colorForPenalty(penalty) {
            penalty /= this.maxPenalty;
            var g = Math.round(255 * (1 - 0.0 * penalty));
            return `rgba(${g}, ${g}, ${g}, 0.333)`;
        },
        colorForAttempts(attempts) {
            attempts /= this.maxAttempts;
            var g = Math.round(255 * (1 - 0.2 * attempts));
            return `rgba(${g}, ${g}, ${g}, 0.333)`;
        },
        colorForRank(rank) {
            for (const rankRule of this.rankRules) {
                if (rank <= rankRule.rank) return rankRule.color;
            }
            return "#eeeeee";
        },
    },
    template: `
    <div :class="[nohilit ? 'nohilit' : 'hilit']">
        <table class="table table-borderless table-sm">
            <thead>
                <tr class="table-head">
                    <th class="t-rank">Rank</th>
                    <th class="t-name">Name</th>
                    <th class="t-score">Solved<transition name="entry-value" mode="out-in"><small v-if="showPenalty"><br/>Time</small></transition></th>
                    <th class="t-penalty" v-if="!showPenalty">Time</th>
                    <th class="t-problem" v-for="problem in problems">{{ problem }}</th>
                    <transition name="entry-value" mode="out-in">
                        <th class="t-attempts" v-if="showAttempts"><small>Attempts</small></th>
                    </transition>
                </tr>
            </thead>
            <transition-group name="leaderboard" tag="tbody">
                <tr v-for="c in contestants" :key="c.name">
                    <transition name="entry-value" mode="out-in">
                        <td class="t-rank" :key="c.rank" :style="{'background-color': colorForRank(c.rank)}">{{ c.rank }}</td>
                    </transition>
                    <td class="t-name"><div class="d-name">{{ c.name }}</div></td>
                    <transition name="entry-value" mode="out-in">
                        <td class="t-score" :key="contId(c)" :style="{'background-color': colorForTotalScore(c.score)}">{{ c.score }}<transition name="entry-value" mode="out-in"><small class="t-penalty" v-if="showPenalty && c.score"><br/>{{ c.penalty }}</small><small class="t-penalty" v-if="showPenalty && !c.score"><br/>&nbsp;</small></transition></td>
                    </transition>
                    <transition v-if="!showPenalty" name="entry-value" mode="out-in">
                        <td class="t-score" :key="c.penalty">
                            {{ c.penalty }}
                        </td>
                    </transition>
                    <transition name="entry-value" mode="out-in" v-for="prob in problems" :key="prob">
                        <td class="t-problem" :key="subId(c.subs[prob])"
                                :style="{'background-color': colorForSub(c.subs[prob])}"><span v-if="!c.subs[prob].attempts">-</span><span v-if="showAttempts && c.subs[prob].attempts">{{ c.subs[prob].attempts }}</span><span v-if="!showAttempts && c.subs[prob].attempts"><i v-if="!c.subs[prob].score" class="fa fa-times" aria-hidden="true"></i><i v-if="c.subs[prob].score" class="fa fa-check" aria-hidden="true"></i></span><transition name="entry-value" mode="out-in"><small class="t-penalty" v-if="showPenalty && c.subs[prob].score"><br/>{{ c.subs[prob].penalty }}</small><small class="t-penalty" v-if="showPenalty && !c.subs[prob].score && c.subs[prob].attempts"><br/>-</small></transition></td>
                    </transition>
                    <transition name="entry-value" mode="out-in">
                        <td class="t-attempts" :key="c.attempts" v-if="showAttempts"
                                :style="{'background-color': colorForAttempts(c.attempts)}">
                            {{ c.attempts }}
                        </td>
                    </transition>
                </tr>
            </transition-group>
        </table>
    </div>
    `
});
