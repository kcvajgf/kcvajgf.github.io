const currentYear = "2019";

// var hackerrank = "http://localhost:8002"
// // var hackerrank = "https://www.hackerrank.com"
// function contestReqData(cslug) {
//     return {
//         url: `${hackerrank}/rest/contests/${cslug}/challenges`,
//         params: {
//             // cslug,
//         },
//         limit: 100,
//     }
// }

// function problemReqData(cslug, slug) {
//     return {
//         url: `${hackerrank}/rest/contests/${cslug}/challenges/${slug}/leaderboard`,
//         params: {
//             // cslug,
//             // slug,
//         },
//         limit: 100,
//     }
// }

function contestReqData(cslug) {
    return {
        url: `contests/${cslug}.json`,
        params: {},
        limit: 100000000,
    }
}

function problemReqData(cslug, slug) {
    return {
        url: 'https://noi-ph-scoreboard.azurewebsites.net/api/HttpTrigger1',
        // url: 'https://live-scoreboard.noi.ph/api/HttpTrigger1',
        params: {
            code: 'DfAanBvy6sSQUm1VtbewRjajhaOsV730a6X7OapGE/g15/dZhJynnA==',
            urlType: 'problem',
            cslug,
            slug,
        },
        limit: 100,
    }
}




Vue.filter('hmPenalty', function(penalty, fixed) {
    var h = Math.floor(penalty / 60);
    var m = (penalty - 60 * h).toFixed(fixed);
    var p = m < 10 ? "0" : "";
    return `${h}:${p}${m}`;
})

function isclose(a, b) {
    return Math.abs(a - b) / Math.max(1, Math.max(Math.abs(a), Math.abs(b))) <= 1e-5;
}

Vue.filter('score', function(score, maxD) {
    if (score == -1) return "-";
    score /= 1;
    var fixed = 0;
    while (fixed < maxD && !isclose(score, +score.toFixed(fixed))) fixed++;
    return score == -1 ? "-" : score.toFixed(fixed);
})


async function fetchWhile(url, params, limit, collList) {
    params.limit = limit;
    var result = []
    for (params.offset = 0;; params.offset += params.limit) {
        var res = collList((await axios.get(url, { params, timeout: 60000 })).data);
        result = result.concat(res);
        if (!res || res.length < params.limit) break; // we've reached the end.
    };
    return result;
}


rankRuleses = {
    "noielims": [
        {rank: 30, color: "#00cc00"},
    ],
    "noielims2016": [
        {rank: 20, color: "#00cc00"},
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
var rankRules = rankRuleses[search.get("type") || "generic"];
var others = {
    "noi-ph-2018-team": "noi-ph-2018-team-early",
    "noi-ph-2017-team": "noi-ph-2017-team-early",
};

if (search && search.get("contest")) {
    var cyear = search && search.get("year") ? search.get("year") : currentYear;
    let base = `noi-ph-${cyear}`;
    if (search.get("contest") == "noielims") {
        if (cyear == "2015") {
            cpast = [`${base}-1`, `${base}-2`];
            cfetch = [];
            rankRules = rankRuleses["noielims2016"];
        } else if (cyear == "2016") {
            cpast = [`${base}-1`, `${base}-2`, `${base}-3`];
            cfetch = [];
            rankRules = rankRuleses["noielims2016"];
        } else {
            cpast = [];
            cfetch = [base];
            rankRules = rankRuleses["noielims"];
        }
    } else if (search.get("contest") == "noipractice") {
        cpast = [];
        cfetch = [`${base}-finals-practice`];
        rankRules = rankRuleses["noifinals"];
    } else if (search.get("contest") == "noifinals1") {
        cpast = [];
        cfetch = `${base}-finals-1`;
        rankRules = rankRuleses["noifinals"];
    } else if (search.get("contest") == "noifinals2") {
        cpast = [`${base}-finals-1`];
        cfetch = [`${base}-finals-2`];
        rankRules = rankRuleses["noifinals"];
    } else if (search.get("contest") == "noiteam") {
        if (cyear == "2015") {
            cpast = [];
            cfetch = [`${base}-finals-2`];
            rankRules = rankRuleses["noiteam"];
        } else {
            cpast = [];
            cfetch = [`${base}-team`];
            rankRules = rankRuleses["noiteam"];
        }
    } else {
        alert(`Unknown contest ${search.get("contest")}`);
        throw `Unknown contest ${search.get("contest")}`;
    }
    if (cyear != currentYear) {
        cpast = cpast.concat(cfetch);
        cfetch = [];
    }
}

console.log("got", cpast, cfetch, rankRules);
if (!rankRules) {
    alert(`Unknown 'type' ${search.get("type")}.`);
    rankRules = [];
}

var curls = cpast.concat(cfetch);

var penaltyFixed = search && search.get("pd") ? parseInt(search.get("pd")) : 0;
var tScoreMax = search && search.get("td") ? parseInt(search.get("td")) : 2;
var scoreMax = search && search.get("sd") ? parseInt(search.get("sd")) : 2;
var nohilit = search && search.get("nohilit") ? parseInt(search.get("nohilit")) : 0;
var missing = search && search.get("missing") ? parseInt(search.get("missing")) : 0;

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
        penaltyFixed,
        tScoreMax,
        scoreMax,
        nohilit,
        missing,
        others,
    },
    async mounted() {
        this.$el.classList.add("board-loading");
        for (const url of this.curls) {
            var key = `contest_${url}`;
            var probs = localStorage.getItem(key);
            if (probs) {
                console.log("Loading contest data", url, "from local storage");
                probs = JSON.parse(probs);
            } else {
                console.log("Fetching contest data", url);
                var reqData = contestReqData(url);
                probs = await fetchWhile(reqData.url, reqData.params, reqData.limit, (x) => x.models).catch((x) => {
                    console.log("Got error", x);
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

        this.fix(); // not needed?

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
            var maxPenalty = 1;
            for (const contestant of this.contestants) maxPenalty = Math.max(maxPenalty, contestant.penalty);
            return maxPenalty;
        },
    },

    methods: {
        setScore(problem, hackerName, score, penalty, fix = true) {
            if (hackerName == "[deleted]") return;
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

            if (!(this.cfetch && this.cfetch.length && this.problemGroups && this.problemGroups.length)) {
                console.log("Empty problem groups. Not running fetch loop.");
                return;
            }

            if (this.startedFetchLoop) {
                console.log("Already started. Ignoring YOU!!!");
                return;
            }
            this.startedFetchLoop = true;

            while (true) {
                for (const group of this.problemGroups) {
                    if (this.cfetch.includes(group.slug)) {
                        for (const prob of group.probs) {
                            await new Promise(resolve => setTimeout(resolve, 6111));
                            await this.fetchProblem(prob).catch((e) => {
                                console.log("Got error", e);
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
            var reqData = problemReqData(problem.contest_slug, problem.slug);
            var subs = await fetchWhile(reqData.url, reqData.params, reqData.limit, (x) => x.models).catch((x) => {
                console.log("Got error", x);
                console.log(`Failed to fetch submission info for problem ${problem.slug} for contest ${problem.contest_slug}. Please try again later.`);
            });
            console.log("Fetched", problem.contest_slug, problem.slug);

            if (others[problem.contest_slug]) {
                console.log("xFetching", others[problem.contest_slug], problem.slug);
                var xreqData = problemReqData(others[problem.contest_slug], problem.slug)
                var xsubs = await fetchWhile(xreqData.url, xreqData.params, xreqData.limit, (x) => x.models).catch((x) => {
                    console.log("xGot error", x);
                    console.log(`xFailed to fetch submission info for problem ${problem.slug} for contest ${others[problem.contest_slug]}. Please try again later.`);
                })
                console.log("xFetched", others[problem.contest_slug], problem.slug);
                if (xsubs) subs = subs.concat(xsubs);
            }

            // save to localStorage
            if (subs) localStorage.setItem(`problem_${problem.id}`, JSON.stringify(subs));
            return subs;
        },

        processSubs(problem, subs, fix) {
            if (subs) for (const sub of subs) {
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
        tColorForScore(score, maxScore) {
            return score == -1 ? `rgba(117, 117, 117)` : "";
        },
        colorForScore(score, maxScore) {
            if (!this.missing && score == -1) return `rgba(222, 222, 222, 0.333)`;
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
            score /= this.maxScore;
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
    <div :class="[problemList.length <= 10 ? 'container' : 'container-fluid', nohilit ? 'nohilit' : 'hilit']">
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
                            :class="['t-problem-head', 't-problem', 'group-label-' + problem.g, 'group-label-par-' + (problem.g % 2)]">
                        <button class="t-problem-link btn btn-sm" v-on:click="fetchProblem(problem)"><small>{{ problem.name }}</small></button>
                    </th>
                </tr>
            </thead>
            <transition-group name="leaderboard" tag="tbody">
                <tr v-for="c in contestants" :key="c.name">
                    <transition name="entry-value" mode="out-in">
                        <td class="t-rank" :key="c.rank" :style="{'background-color': colorForRank(c.rank)}">{{ c.rank }}</td>
                    </transition>
                    <td class="t-name"><div class="d-name">{{ c.name }}</div></td>
                    <transition name="entry-value" mode="out-in">
                        <td class="t-score" :key="c.score" :style="{'background-color': colorForTotalScore(c.score)}">{{ c.score | score(tScoreMax) }}</td>
                    </transition>
                    <transition name="entry-value" mode="out-in">
                        <td class="t-penalty" :key="c.penalty" v-if="showPenalty"
                                :style="{'background-color': colorForPenalty(c.penalty)}"><small>{{ c.penalty | hmPenalty(penaltyFixed) }}</small></td>
                    </transition>
                    <transition name="entry-value" mode="out-in" v-for="prob in problemList" :key="prob.slug">
                        <td v-if="loadedProblem[prob.id]" class="t-problem" :key="c.subs[prob.id].score"
                                :style="{'background-color': colorForScore(c.subs[prob.id].score, prob.max_score),
                                    'color': tColorForScore(c.subs[prob.id].score, prob.max_score)}">
                            {{ c.subs[prob.id].score | score(scoreMax) }}
                        </td>
                        <td v-if="!loadedProblem[prob.id]" class="t-problem" :key="c.subs[prob.id].score" style="background-color: #bbf">
                            Loading...
                        </td>
                    </transition>
                </tr>
            </transition-group>
        </table>
    </div>
    `
});
