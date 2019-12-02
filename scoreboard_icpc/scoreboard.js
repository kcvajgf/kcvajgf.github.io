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
    getScoreAttPen = function(scoreAttPen) {
        var parts = scoreAttPen.split("/");
        if (parts.length != 2) console.log(`WARNING: INVALID SCOREATTPEN ${scoreAttPen}`)
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
    getSummaryScoreAttPen = function(sumScoreAttPen) {
        var parts = sumScoreAttPen.split("/");
        if (parts.length != 3) console.log(`WARNING: INVALID SUMMARYSCOREATTPEN ${sumScoreAttPen}`)
        var att = parseInt(parts[0]), score = parseInt(parts[2]), pen;
        if (parts[1] == "--") {
            pen = 0;
        } else {
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
        } else if (children[1].innerText.trim() == "Submitted/1st Yes/Total Yes") {
            var attsolv = getAttSolv(children[children.length - 1].innerText.trim());
            res.summary = {
                attempts: attsolv.att,
                score: attsolv.solv,
                penalty: Number.POSITIVE_INFINITY,
                subs: {},
            };
            children.each((idx, ch) => {
                if (!(4 <= idx && idx < children.length - 1)) return;
                var sumScoreAttPen = getSummaryScoreAttPen(ch.innerText.trim());
                res.summary.subs[res.problems[idx - 4]] = {
                    score: sumScoreAttPen.score,
                    attempts: sumScoreAttPen.att,
                    penalty: sumScoreAttPen.pen,
                    loaded: true,
                };
                if (sumScoreAttPen.score) {
                    res.summary.penalty = Math.min(res.summary.penalty, sumScoreAttPen.pen);
                }
            });
            if (res.summary.penalty >= Number.POSITIVE_INFINITY) res.summary.penalty = 0;
        }
    });
    return res;
}
let demo = false;

function extractFrom(word, source) {
    let i = source.search(word);
    return i >= 0 ? source.substring(i + word.length) : "";
}

rankRuleses = {
    "wf": [
        {rank: 4, 'class': "scoreboard-rank-gold"},
        {rank: 8, 'class': "scoreboard-rank-silver"},
        {rank: 12, 'class': "scoreboard-rank-bronze"},
    ],
    "generic": [
        {rank: 1, 'class': "scoreboard-rank-gold"},
        {rank: 2, 'class': "scoreboard-rank-silver"},
        {rank: 3, 'class': "scoreboard-rank-bronze"},
    ],
}

var search = new URLSearchParams(window.location.search);

var leaderboardSource = (
        search && search.get("src") ? search.get("src") :
        demo ? "http://localhost:8000" :
        [location.protocol, '//', location.host, location.pathname, 'html'].join('')
    );
var nohilit = search && search.get("nohilit") ? parseInt(search.get("nohilit")) : 0;

var rankRules = rankRuleses[search.get("type") || "generic"]
if (!rankRules) {
    alert(`Unknown 'type' ${search.get("type")}.`);
    rankRules = [];
}


var overwrittenLabels = window.labels || {};
var labels = {
    attempts: "Attempts",
    solved: "Solved",
    time: "Time",
    rank: "Rank",
    name: "Name",
    subCount: "Total Submitted",
    isSolved: "Solved?",
    totalYes: "Total Yes",
    firstYes: "1st Yes",
    showAttemptCount: "Show # tries",
    showTimes: "Show times",
    hilitOnHover: "Highlight on hover",
    blankPenalty: ".",
    blankAttempt: ".",
};

for (const name in overwrittenLabels) labels[name] = overwrittenLabels[name];

var vm = new Vue({
    el: '#leaderboard',
    data: {
        problems: [],
        contestants: [],
        summary: null,
        loadedAll: false,
        leaderboardSource,
        rankRules,
        demo,
        showAttempts: true,
        showPenalty: true,
        hilit: !nohilit,
        labels: labels,
        startedFetchLoop: false,
    },
    async mounted() {
        this.$el.classList.remove("board-created");
        this.$el.classList.add("board-loading");

        this.$on("setShowAttempts", (value) => {
            if (this.showAttempts != value) {
                this.showAttempts = value;
                this.bufferLoad();
            }
        });
        this.$on("setShowPenalty", (value) => {
            if (this.showPenalty != value) {
                this.showPenalty = value;
                this.bufferLoad();
            }
        });
        this.$on("setHilit", (value) => { this.hilit = value; });

        await this.initFetchAll();

        setTimeout(() => {
            this.$el.classList.remove("board-loading");
            this.$el.classList.add("board-created");
        }, 1000);

        this.startFetchLoop();
    },
    created() {
        document.addEventListener("visibilitychange", this.bufferLoad);
    },
    computed: {
        nameContestant() {
            var nameContestant = {};
            for (const contestant of this.contestants) {
                nameContestant[contestant.name] = contestant;
            }
            return nameContestant;
        },

        maxScore() {
            var maxScore = 1;
            for (const contestant of this.contestants) {
                maxScore = Math.max(maxScore, contestant.score);
            }
            return maxScore;

        },

        maxPenalty() {
            var maxPenalty = 1;
            for (const contestant of this.contestants) {
                maxPenalty = Math.max(maxPenalty, contestant.penalty);
            }
            return maxPenalty;
        },

        maxAttempts() {
            var maxAttempts = 1;
            for (const contestant of this.contestants) {
                maxAttempts = Math.max(maxAttempts, contestant.attempts);
            }
            return maxAttempts;
        },
    },

    methods: {
        bufferLoad() {
            this.$el.classList.remove("board-created");
            this.$el.classList.add("board-loading");
            setTimeout(() => {
                this.$el.classList.remove("board-loading");
                this.$el.classList.add("board-created");
            }, 1000);
        },
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
            if (allData.title && allData.title.length > 0) {
                $(".scoreboard-contest-name").text(allData.title);
            }
            if (allData.lastUpdated && allData.lastUpdated.length > 0) {
                $(".scoreboard-last-updated-str").text("Last updated");
                $(".scoreboard-last-updated").text(allData.lastUpdated);
            }
        },

        async initFetchAll() {
            // load from localStorage
            var allData = localStorage.getItem(this.leaderboardSource);
            if (!this.demo && allData) {
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
            if (!this.demo && allData) localStorage.setItem(this.leaderboardSource, JSON.stringify(allData));
            return allData;
        },

        async fetchAll(problem) {
            this.processData(await this.fetchData());
        },

        processData(allData) {
            if (allData) {
                console.log("processing", allData);
                this.problems = allData.problems;
                this.contestants = allData.contestants;
                this.summary = allData.summary;
                this.updateMetadata(allData);
            }
        },

        // these are mostly just filter-like things.
        classForSub(c, prob) {
            let sub = c.subs[prob];
            if (sub.pending) {
                return "scoreboard-score-pending";
            } else if (sub.attempts == 0) {
                return "scoreboard-score-blank";
            } else if (sub.score == 0) {
                return "scoreboard-score-no";
            } else if (sub.score > 0) {
                let summary = this.getSummary();
                return (summary && sub.penalty == summary.subs[prob].penalty ?
                        "scoreboard-score-yes scoreboard-score-firstyes" : "scoreboard-score-yes");
            } else {
                return "scoreboard-score-unknown";
            }
        },
        classForSummarySub(sub) {
            if (sub.attempts == 0) {
                return "scoreboard-score-blank";
            } else if (sub.score == 0) {
                return "scoreboard-score-no";
            } else if (sub.score > 0) {
                return "scoreboard-score-yes";
            } else {
                return "scoreboard-score-unknown";
            }
        },
        summaryKey() {
            let i = 0;
            while (this.nameContestant["summary_".concat(i)]) i++;
            return "summary_".concat(i);
        },
        headerKey() {
            let i = 0;
            while (this.nameContestant["header_".concat(i)]) i++;
            return "header_".concat(i);
        },
        tries(n) {
            if (n == 1) return "1 try";
            return `${n} tries`;
        },
        subId(sub) {
            return `${sub.score}_${sub.attempts}_${sub.penalty}_${sub.pending}`;
        },
        getSummary() {
            if (this.summary && this.summary.subs) {
                return this.summary;
            } else {
                return {
                    attempts: 0,
                    score: 0,
                    penalty: Number.POSITIVE_INFINITY,
                    subs: {},
                };
            }
        },
        summarySubs(prob) {
            if (this.summary && this.summary.subs && this.summary.subs[prob]) {
                return this.summary.subs[prob];
            } else {
                return {
                    score: 0,
                    attempts: 0,
                    penalty: Number.POSITIVE_INFINITY,
                    loaded: false,
                };
            }
        },
        contId(cont) {
            return `${cont.score}_${cont.penalty}`;
        },
        summaryId(summary) {
            return `${summary.score}_${summary.penalty}_${summary.attempts}`;
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
        classForRank(rank) {
            for (const rankRule of this.rankRules) {
                if (rank <= rankRule.rank) return rankRule['class'];
            }
            return 'scoreboard-rank-blank';
        },
    },
    template: `
    <div class="leaderboard" :class="[hilit ? 'hilit' : 'nohilit']">
        <table class="table table-borderless table-sm">
            <thead>
                <tr class="table-head">
                    <th class="t-rank">{{labels.rank}}</th>
                    <th class="t-name">{{labels.name}}</th>
                    <th class="t-score">
                        {{labels.solved}}
                        <transition name="entry-value" mode="out-in">
                            <small v-if="showPenalty"><br/>{{labels.time}}</small>
                        </transition>
                    </th>
                    <th class="t-penalty" v-if="!showPenalty">{{labels.time}}</th>
                    <th class="t-problem" v-for="problem in problems">{{ problem }}</th>
                    <transition name="entry-value" mode="out-in">
                        <th class="t-attempts"><small>{{labels.attempts}}</small></th>
                    </transition>
                </tr>
            </thead>
            <transition-group name="leaderboard" tag="tbody">
                <tr class="contestant" v-for="c in contestants" :key="c.name">
                    <transition name="entry-value" mode="out-in">
                        <td class="t-rank" :key="c.rank" :class="classForRank(c.rank)">{{ c.rank }}</td>
                    </transition>
                    <td class="t-name"><div class="d-name">{{ c.name }}</div></td>
                    <transition name="entry-value" mode="out-in">
                        <td class="t-score" :key="contId(c)"
                            :style="{'background-color': colorForTotalScore(c.score)}">
                            {{ c.score }}
                            <transition name="entry-value" mode="out-in">
                                <small class="t-penalty"
                                       v-if="showPenalty && c.score"><br/>{{ c.penalty }}</small>
                                <small class="t-penalty"
                                       v-if="showPenalty && !c.score"><br/>&nbsp;</small>
                            </transition>
                        </td>
                    </transition>
                    <transition v-if="!showPenalty" name="entry-value" mode="out-in">
                        <td class="t-score" :key="c.penalty">
                            {{ c.penalty }}
                        </td>
                    </transition>
                    <transition name="entry-value" mode="out-in" v-for="prob in problems" :key="prob">
                        <td class="t-problem" :key="subId(c.subs[prob])"
                                :class="classForSub(c, prob)">
                            <span v-if="showAttempts && !showPenalty">
                                <small v-if="!c.subs[prob].attempts">
                                    {{labels.blankAttempt}}
                                </small>
                                <small v-if="c.subs[prob].attempts">
                                    {{c.subs[prob].attempts}}
                                </small>
                            </span>
                            <span v-if="(!showAttempts || !showPenalty) && c.subs[prob].attempts">
                                <i v-if="!c.subs[prob].score && c.subs[prob].pending"
                                   class="fas fa-question verdict-pending" :class="{'fa-xs': showAttempts}" aria-hidden="true"></i>
                                <i v-if="!c.subs[prob].score && !c.subs[prob].pending"
                                   class="fas fa-times verdict-wa" :class="{'fa-xs': showAttempts}" aria-hidden="true"></i>
                                <i v-if="c.subs[prob].score"
                                   class="fas fa-check verdict-ac" :class="{'fa-xs': showAttempts}" aria-hidden="true"></i>
                            </span>
                            <transition name="entry-value" mode="out-in">
                                <span v-if="showPenalty">
                                    <span v-if="!showAttempts"><br/></span>
                                    <span class="t-penalty"
                                           v-if="c.subs[prob].score">
                                        {{ c.subs[prob].penalty }}
                                    </span>
                                    <span class="t-penalty"
                                           v-if="!c.subs[prob].score && (!showAttempts || c.subs[prob].attempts)">
                                        {{c.subs[prob].pending?'?':labels.blankPenalty}}
                                    </span>
                                </span>
                            </transition>
                            <span v-if="showAttempts && showPenalty">
                                <br/>
                                <small>
                                    <span v-if="!c.subs[prob].attempts">
                                        {{labels.blankAttempt}}
                                    </span>
                                    <span v-if="c.subs[prob].attempts">
                                        {{tries(c.subs[prob].attempts)}}
                                    </span>
                                </small>
                            </span>
                        </td>
                    </transition>
                    <transition name="entry-value" mode="out-in">
                        <td class="t-attempts" :key="c.attempts"
                                :style="{'background-color': colorForAttempts(c.attempts)}">
                            {{ c.attempts }}
                        </td>
                    </transition>
                </tr>
                <tr class="table-foot" :key="headerKey()">
                    <td class="header-repeat t-rank">{{labels.rank}}</td>
                    <td class="header-repeat t-name">{{labels.name}}</td>
                    <td class="header-repeat t-score">
                        {{labels.solved}}
                        <transition name="entry-value" mode="out-in">
                            <small v-if="showPenalty"><br/>{{labels.time}}</small>
                        </transition>
                    </td>
                    <td class="header-repeat t-penalty" v-if="!showPenalty">{{labels.time}}</td>
                    <td class="header-repeat t-problem" v-for="problem in problems">{{ problem }}</td>
                    <transition name="entry-value" mode="out-in">
                        <td class="header-repeat t-attempts"><small>{{labels.attempts}}</small></td>
                    </transition>
                </tr>
                <tr class="table-foot leaderboard-summary" :key="summaryKey()">
                    <td class="t-rank scoreboard-rank-blank"></td>
                    <td class="t-name">
                        <span class="footer-subcount">{{labels.isSolved}}</span>
                        <br/>
                        <span class="footer-subcount">{{labels.firstYes}}</span>
                        <br/>
                        <span class="footer-subcount">{{labels.subCount}}</span>
                        <br/>
                        <span class="footer-subcount">{{labels.totalYes}}</span>
                    </td>
                    <transition name="entry-value" mode="out-in">
                        <td class="t-score" :key="summaryId(getSummary())">
                            <br/>
                            <transition name="entry-value" mode="out-in">
                                <span class="t-penalty" v-if="getSummary().score">
                                    {{getSummary().penalty}}
                                </span>
                                <span class="t-penalty" v-if="!getSummary().score">
                                    {{labels.blankPenalty}}
                                </span>
                            </transition>
                            <br/>
                            <small>{{ tries(getSummary().attempts)}}</small>
                            <br/>
                            {{ getSummary().score }}
                        </td>
                    </transition>
                    <td v-if="!showPenalty" class="t-score"></td>
                    <transition name="entry-value" mode="out-in" v-for="prob in problems" :key="prob">
                        <td class="t-problem" :key="subId(getSummary().subs[prob])"
                                :class="classForSummarySub(summarySubs(prob))">

                            <span v-if="summarySubs(prob).attempts">
                                <i v-if="!summarySubs(prob).score"
                                   class="fas fa-times verdict-wa" aria-hidden="true"></i>
                                <i v-if="summarySubs(prob).score"
                                   class="fas fa-check verdict-ac" aria-hidden="true"></i>
                            </span>
                            <br/>
                            <transition name="entry-value" mode="out-in">
                                <span class="t-penalty" v-if="summarySubs(prob).score">
                                    {{ summarySubs(prob).penalty }}
                                </span>
                                <span class="t-penalty" v-if="!summarySubs(prob).score">
                                    {{summarySubs(prob).pending?'?':labels.blankPenalty}}
                                </span>
                            </transition>
                            <br/>
                            <small v-if="!summarySubs(prob).attempts">
                                {{labels.blankAttempt}}
                            </small>
                            <small v-if="summarySubs(prob).attempts">
                                {{tries(summarySubs(prob).attempts)}}
                            </small>
                            <br/>
                            {{summarySubs(prob).score}}
                        </td>
                    </transition>
                    <td class="t-attempts" :key="getSummary().attempts">
                            {{ getSummary().attempts }}
                        </td>
                    </transition>
                </tr>
            </transition-group>
        </table>
    </div>
    `
});

var controlsVm = new Vue({
    el: '#leaderboard-controls',
    data: {
        showAttempts: true,
        showPenalty: true,
        hilit: !nohilit,
        labels: labels,
    },
    methods: {
        updateShowAttempts() {
            vm.$emit("setShowAttempts", this.showAttempts);
        },
        updateShowPenalty() {
            vm.$emit("setShowPenalty", this.showPenalty);
        },
        updateHilit() {
            vm.$emit("setHilit", this.hilit);
        },
    },
    template: `
        <form class="leaderboard-controls">
            <div class="form-check form-check-inline">
                <input class="form-check-input"
                       type="checkbox"
                       id="controls-show-attempts"
                       v-model="showAttempts"
                       v-on:change="updateShowAttempts()"/>
                <label class="form-check-label" for="controls-show-attempts">{{labels.showAttemptCount}}</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input"
                       type="checkbox"
                       id="controls-show-penalty"
                       v-model="showPenalty"
                       v-on:change="updateShowPenalty()"/>
                <label class="form-check-label" for="controls-show-penalty">{{labels.showTimes}}</label>
            </div>
            <!-- <div class="form-check form-check-inline">
                <input class="form-check-input"
                       type="checkbox"
                       id="controls-hilit"
                       v-model="hilit"
                       v-on:change="updateHilit()"/>
                <label class="form-check-label" for="controls-hilit">{{labels.hilitOnHover}}</label>
            </div> -->
        </form>
    `
})
