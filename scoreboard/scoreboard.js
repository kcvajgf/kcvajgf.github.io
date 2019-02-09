var hackerrank = "http://localhost:8000"
// var hackerrank = "https://www.hackerrank.com"

Vue.filter('hmPenalty', function(penalty) {
    var h = Math.floor(penalty / 60);
    var m = (penalty - 60 * h).toFixed(0);
    var p = m < 10 ? "0" : "";
    return `${h}:${p}${m}`;
})


Vue.filter('score', function(score) {
    return score == -1 ? "" : (score / 1).toFixed(2);
})


async function fetchWhile(url, params, collList) {
    params.limit = 100;
    var result = []
    for (params.offset = 0;; params.offset += params.limit) {
        var res = collList((await axios.get(url, { params })).data);
        result = result.concat(res);
        if (res.length < params.limit) break; // we've reached the end.
    };
    return result;
}


rankRuleses = {
    "noielims": [
        {rank: 30, color: "#00cc00"},
    ],
    "noifinals": [
        {rank: 1, color: "#ffd700"},
        {rank: 3, color: "#c0c0c0"},
        {rank: 6, color: "#cd7f32"},
        {rank: 10, color: "#00bb00"},
    ],
    "noiteam": [
        {rank: 4, color: "#00cc00"},
    ],
    "generic": [],
}

var search = new URLSearchParams(window.location.search);

var cpast = search && search.get("past") ? search.get("past").split(",") : [];
var cfetch = search && search.get("fetch") ? search.get("fetch").split(",") : [];
var curls = cpast.concat(cfetch);

console.log(curls)
var rankRules = rankRuleses[search.get("type") || "generic"]
if (!rankRules) {
    alert(`Unknown type ${search.get("type")}.`);
    rankRules = [];
}

var vm = new Vue({
    el: '#leaderboard',
    data: {
        problemGroups: [],
        contestants: [],
        loadedProblem: {},
        cpast,
        cfetch,
        curls,
        rankRules,
        showPenalty: true,
        startedFetchLoop: false,
    },
    async mounted() {
        this.$el.classList.add("board-loading");
        this.problemGroups = [];
        for (const url of this.curls) {
            var key = `contest_${url}`;
            var probs = localStorage.getItem(key);
            if (probs) {
                console.log("Loading contest data", url, "from local storage");
                probs = JSON.parse(probs);
            } else {
                console.log("Fetching contest data", url);
                probs = await fetchWhile(`${hackerrank}/rest/contests/${url}/challenges`, {}, (x) => x.models).catch((x) => {
                    alert(`Failed to fetch problem info for ${url}. Please try again later.`);
                });
                if (probs) localStorage.setItem(key, JSON.stringify(probs))
            }
            console.log("Loaded contest data", url);
            if (probs && probs.length) {
                for (var j = 0; j < probs.length; j++) {
                    probs[j].id = `${url}...${probs[j].slug}`;
                }
                this.problemGroups.push({
                    label: url,
                    slug: url,
                    probs: probs,
                });
            }
        }
            
        var promises = [];
        for (const group of this.problemGroups) {
            for (const prob of group.probs) {
                promises.push(this.initFetchProblem(prob), false);
            }
        }
        await Promise.all(promises);

        this.fix();

        setTimeout(() => {
            this.$el.classList.remove("board-loading");
            this.$el.classList.add("board-created");
        }, 1000);

        this.startFetchLoop();
    },
    computed: {
        problemList() {
            var lst = [];
            for (var g = 0; g < this.problemGroups.length; g++) {
                for (const prob of this.problemGroups[g].probs) {
                    prob.g = g;
                    lst.push(prob);
                }
            }
            return lst;
        },

        idProblem() {
            var idProblem = {};
            for (const prob of this.problemList) idProblem[prob.id] = prob;
            return idProblem;
        },

        maxScore() {
            var maxScore = 0;
            for (const problem of this.problemList) maxScore += problem.max_score;
            return Math.max(1, maxScore);
        },

        nameContestant() {
            var nameContestant = {};
            for (const contestant of this.contestants) nameContestant[contestant.name] = contestant;
            return nameContestant;
        },

        maxPenalty() {
            var maxPenalty = 0;
            for (const contestant of this.contestants) maxPenalty = Math.max(maxPenalty, contestant.penalty);
            return Math.max(1, maxPenalty);
        },
    },

    methods: {
        setScore(problem, hackerName, score, penalty, fix = true) {
            var contestant = this.getOrCreateContestant(hackerName, false);
            var prob = contestant.subs[problem.id];
            prob.score = score;
            prob.penalty = penalty;
            if (fix) this.fix();
        },

        async fetchProblem(problem, fix = true) {
            problem = this.getProblem(problem);
            if (!problem) console.log("WARNING: PROBLEM NOT FOUND!");
            this.processSubs(problem, await this.fetchProblemSubs(problem), fix);
        },

        getOrCreateContestant(name, fix = true) {
            var contestant = this.nameContestant[name];
            if (contestant) return contestant;
            // this is a new guy. create a new contestant
            var subs = {};
            for (const prob of this.problemList) {
                subs[prob.id] = {
                    score: -1,
                    penalty: 0,
                };
            }
            contestant = {
                name: name,
                subs: subs,
                score: 0,
                penalty: 0,
            };
            this.contestants.push(contestant);
            if (fix) this.fix();
            return contestant;
        },

        async startFetchLoop() {
            console.log("Starting Fetch Loop");

            if (this.startedFetchLoop) {
                console.log("Already started. Ignoring YOU!!!");
                return;
            }
            this.startedFetchLoop = true;

            while (true) {
                for (const group of this.problemGroups) {
                    if (this.cfetch.includes(group.slug)) {
                        for (const prob of group.probs) {
                            await new Promise(resolve => setTimeout(resolve, 6111)); // feels hacky
                            await this.fetchProblem(prob).catch((e) => {
                                console.log("Failed to load", prob.id, "! Never mind. I'll try again later.")
                            });
                        }
                    }
                }
            }
        },

        getProblem(prob) {
            if (typeof prob === 'string' || prob instanceof String) {
                var problem = this.idProblem[prob];
                if (!problem) alert(`Unknown problem: ${prob}`);
                return problem;
            } else {
                return prob;
            }
        },

        async initFetchProblem(prob) {
            prob = this.getProblem(prob);
            if (!prob) console.log("WARNING: PROBLEM NOT FOUND");

            // load from localStorage
            var subs = localStorage.getItem(`problem_${prob.id}`);
            if (subs) {
                console.log("Loading", prob.contest_slug, prob.slug, "from local storage");
                subs = JSON.parse(subs);
                console.log("Loaded", prob.contest_slug, prob.slug);
            } else {
                subs = await this.fetchProblemSubs(prob);
            }
            this.processSubs(prob, subs, true);
            this.loadedProblem[prob.id] = true;
        },

        async fetchProblemSubs(problem) {
            console.log("Fetching", problem.contest_slug, problem.slug);
            var subs = await fetchWhile(`${hackerrank}/rest/contests/${problem.contest_slug}/challenges/${problem.slug}/leaderboard`, {}, (x) => x).catch((x) => {
                console.log(`Failed to fetch submission info for problem ${problem.slug} for contest ${problem.contest_slug}. Please try again later.`);
            });
            console.log("Fetched", problem.contest_slug, problem.slug);

            // save to localStorage
            if (subs) localStorage.setItem(`problem_${problem.id}`, JSON.stringify(subs));
            return subs;
        },

        processSubs(problem, subs, fix) {
            for (const sub of subs) {
                this.setScore(problem, sub.hacker, parseFloat(sub.score), parseFloat(sub.time_taken), false);
            }
            if (fix) this.fix();
        },

        recomputeAggregates() {
            for (const contestant of this.contestants) {
                var scoreTotal = 0, penaltyTotal = 0;
                for (const group of this.problemGroups) {
                    var penaltyMax = 0;
                    for (const prob of group.probs) {
                        scoreTotal += Math.max(0, contestant.subs[prob.id].score);
                        penaltyMax = Math.max(penaltyMax, contestant.subs[prob.id].penalty);
                    }
                    penaltyTotal += penaltyMax;
                }
                contestant.score = scoreTotal;
                contestant.penalty = penaltyTotal;
            }
        },

        rerank() {
            this.contestants.sort(function(x, y) {
                if (x.score != y.score) return y.score - x.score;
                if (x.penalty != y.penalty) return x.penalty - y.penalty;
                return 0;
            });

            for (var i = 0, rank = 0; i < this.contestants.length; i++) {
                if (i == 0 || this.contestants[i - 1].score != this.contestants[i].score || 
                        this.contestants[i - 1].penalty != this.contestants[i].penalty) {
                    rank = i + 1;
                }
                this.contestants[i].rank = rank;
            }
        },

        fix() {
            this.contestants = this.contestants.slice(); // so that vue.js notices... feels hacky though.
            this.recomputeAggregates();
            this.rerank();
        },

        // these are mostly just filter-like things.
        colorForScore(score, maxScore) {
            score = Math.max(score, 0) / maxScore;
            if (score <= 0.5) {
                var gr = Math.round(255 * 2 * score);
                return `rgba(255, ${gr}, 0, 0.333)`
            } else {
                var rd = Math.round(255 * 2 * (1 - score))
                return `rgba(${rd}, 255, 0, 0.333)`
            }
        },
        colorForTotalScore(score) {
            score = score / this.maxScore;
            var rb = Math.round(255 * (1 - score));
            return `rgba(${rb}, 255, ${rb}, 0.333)`
        },
        colorForPenalty(penalty) {
            penalty /= this.maxPenalty;
            var g = Math.round(255 * (1 - 0.5 * penalty));
            return `rgba(${g}, ${g}, ${g}, 0.333)`
        },
        colorForRank(rank) {
            for (const rankRule of this.rankRules) {
                if (rank <= rankRule.rank) return rankRule.color;
            }
            return "#eeeeee";
        },
    },
    template: `
    <div class="container-fluid">
        <!-- <div class="row">
            <div class="col-sm">
                <button class="btn btn-primary" v-on:click="randomSolve">Random solve!</button>
                <button class="btn" v-on:click="newGuy">Random new guy!</button>
            </div>
        </div> -->
        <div class="row">
            <div class="col-sm">
                <table class="table table-borderless table-sm">
                    <thead>
                        <tr class="table-head">
                            <th class="t-rank"></th>
                            <th class="t-name"></th>
                            <th class="t-score"></th>
                            <th class="t-penalty" v-if="showPenalty"></th>
                            <th v-for="(probg, index) in problemGroups" :key="probg.slug" :colspan="probg.probs.length"
                                    :class="['t-problem-group', 'group-label-' + index, 'group-label-par-' + (index % 2)]">
                                <small>{{ probg.label }}</small>
                            </th>
                        </tr>
                        <tr class="table-head">
                            <th class="t-rank">Rank</th>
                            <th class="t-name">Name</th>
                            <th class="t-score">Score</th>
                            <th class="t-penalty" v-if="showPenalty">Time</th>
                            <th v-for="problem in problemList" :key="problem.slug"
                                    :class="['t-problem', 'group-label-' + problem.g, 'group-label-par-' + (problem.g % 2)]">
                                <button class="btn btn-link btn-sm" v-on:click="fetchProblem(problem)"><small>{{ problem.name }}</small></button>
                            </th>
                        </tr>
                    </thead>
                    <transition-group name="leaderboard" tag="tbody">
                        <tr v-for="c in contestants" :key="c.name">
                            <transition name="entry-value" mode="out-in">
                                <td class="t-rank" :key="c.rank" :style="{'background-color': colorForRank(c.rank)}">{{ c.rank }}</td>
                            </transition>
                            <td clsas="t-name">{{ c.name }}</td>
                            <transition name="entry-value" mode="out-in">
                                <td class="t-score" :key="c.score" :style="{'background-color': colorForTotalScore(c.score)}">{{ c.score | score }}</td>
                            </transition>
                            <transition name="entry-value" mode="out-in">
                                <td class="t-penalty" :key="c.penalty" v-if="showPenalty"
                                        :style="{'background-color': colorForPenalty(c.penalty)}"><small>{{ c.penalty | hmPenalty }}</small></td>
                            </transition>
                            <transition name="entry-value" mode="out-in" v-for="prob in problemList" :key="prob.slug">
                                <td v-if="loadedProblem[prob.id]" class="t-problem" :key="c.subs[prob.id].score"
                                        :style="{'background-color': colorForScore(c.subs[prob.id].score, prob.max_score)}">
                                    {{ c.subs[prob.id].score | score }}
                                </td>
                                <td v-if="!loadedProblem[prob.id]" class="t-problem" :key="c.subs[prob.id].score" style="background-color: #bbf">
                                    Loading...
                                </td>
                            </transition>
                        </tr>
                    </transition-group>
                </table>
            </div>
        </div>
    </div>
    `
});