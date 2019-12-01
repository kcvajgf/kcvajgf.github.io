// by Kevin Atienza

async function fetchData(source) {
    var el = $( '<div></div>' );
    el.html((await axios.get(`${source}/index.html`, { timeout: 10000 })).data);
    var res = {
        problems: null,
        contestants: [],
        title: el.find("title").text(),
        lastUpdated: extractFrom("Last updated", el.find(".tail").text()),
    };


    getAttSolv = function(attsolv) {
        var parts = attsolv.split("/");
        if (parts.length != 2) console.log(`WARNING: INVALID ATTSOLV ${attsolv}`)
        return {
            att: parseInt(parts[0]),
            solv: parseInt(parts[1]),
        }
    };
    getScoreAttPen = function(scoreattpen) {
        var parts = scoreattpen.split("/");
        if (parts.length != 2) console.log(`WARNING: INVALID SCOREATTPEN ${scoreattpen}`)
        var att = parseInt(parts[0]), score, pen;
        if (parts[1] == "--") {
            score = 0;
            pen = 0;
        } else {
            score = 1;
            pen = parseInt(parts[1]);
        }
        return { score, att, pen };
    };

    el.find("table tr").each((index, value) => {
        var children = $(value).children();
        if (children.prop("tagName").toUpperCase() == "TH") {
            if (res.problems == null) {
                res.problems = [];
                children.each((idx, ch) => {
                    if (!(4 <= idx && idx < children.length - 1)) return;
                    var prob = ch.innerText.trim();
                    res.problems.push(prob);
                });
            } else {
                children.each((idx, ch) => {
                    if (!(4 <= idx && idx < children.length - 1)) return;
                    var prob = ch.innerText.trim();
                    if (prob != res.problems[idx - 4]) console.log("WARNING: PROBLEM MISMATCH AT", idx);
                });
            }
        } else if (children[0].innerText.trim().length) {
            var c = {
                rank: parseInt(children[0].innerText.trim()),
                name: children[1].innerText.trim(),
                score: children[2].innerText.trim(),
                penalty: children[3].innerText.trim(),
                subs: {},
            };
            var attsolv = getAttSolv(children[children.length - 1].innerText.trim());
            if (attsolv.solv != c.score) console.log("WARNING: SOLVE COUNT MISMATCH");
            c.attempts = attsolv.att;
            var sc = 0;
            children.each((idx, ch) => {
                if (!(4 <= idx && idx < children.length - 1)) return;
                var scoreAttPen = getScoreAttPen(ch.innerText.trim());
                sc += scoreAttPen.score;
                c.subs[res.problems[idx - 4]] = {
                    score: scoreAttPen.score,
                    attempts: scoreAttPen.att,
                    penalty: scoreAttPen.pen,
                    pending: $(ch).is('.pending'),
                };
            });
            if (sc != c.score) console.log("WARNING: SCORE MISMATCH");
            res.contestants.push(c);
        }
    });
    return res;
}

function extractFrom(word, source) {
    let i = source.search(word);
    return i >= 0 ? source.substring(i + word.length) : "";
}

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

var leaderboardSource = search && search.get("src") ? search.get("src") : [location.protocol, '//', location.host, location.pathname, 'html'].join('');
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

        updateMetadata(allData) {
            if (allData.title && allData.title.length > 0) $(".scoreboard-contest-name").text(allData.title);
            if (allData.lastUpdated && allData.lastUpdated.length > 0) {
                $(".scoreboard-last-updated-str").text("Last updated");
                $(".scoreboard-last-updated").text(allData.lastUpdated);
            }
        },

        async initFetchAll() {
            // load from localStorage
            var allData = localStorage.getItem(this.leaderboardSource);
            if (allData) {
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
            if (allData) localStorage.setItem(this.leaderboardSource, JSON.stringify(allData));
            return allData;
        },

        async fetchAll(problem) {
            this.processData(await this.fetchData());
        },

        processData(allData) {
            if (allData) {
                this.problems = allData.problems;
                this.contestants = allData.contestants;
                this.updateMetadata(allData);
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
            return `${sub.score}_${sub.attempts}_${sub.penalty}_${sub.pending}`;
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
                                :style="{'background-color': colorForSub(c.subs[prob])}"><span v-if="!c.subs[prob].attempts">-</span><span v-if="showAttempts && c.subs[prob].attempts">{{ c.subs[prob].attempts }}</span><span v-if="!showAttempts && c.subs[prob].attempts"><i v-if="!c.subs[prob].score" class="fa fa-times" aria-hidden="true"></i><i v-if="c.subs[prob].score" class="fa fa-check" aria-hidden="true"></i></span><transition name="entry-value" mode="out-in"><small class="t-penalty" v-if="showPenalty && c.subs[prob].score"><br/>{{ c.subs[prob].penalty }}</small><small class="t-penalty" v-if="showPenalty && !c.subs[prob].score && c.subs[prob].attempts"><br/>{{c.subs[prob].pending?'?':'-'}}</small></transition></td>
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
