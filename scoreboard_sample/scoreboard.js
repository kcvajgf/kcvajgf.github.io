var probgroups = [
    {label: "Day 1", names: ["foo", "fool", "bar", "barl", "coo"]},
    {label: "Day 2", names: ["cool", "car", "carl", "lol", "zorz"]},
]
var sampleProblems = [];
var probt = 0;
for (var g = 0; g < probgroups.length; g++) {
    var gr = [];
    for (var i = 0; i < probgroups[g].names.length; i++) {
        gr.push({
            name: probgroups[g].names[i],
            max_score: 100,
        });
        probt++;
    }
    sampleProblems.push({label: probgroups[g].label, probs: gr});
}

Vue.filter('score', function(score, missing) {
    return !missing && score == -1 ? "-" : Math.max(0, score);
})


var mor = "WyJTdGV2ZW4gSGFsaW0iLCJDYXJsU2FnYW40MiIsIk1yTGxhbWFTQyIsIkEgdmVyeSB2ZXJ5IGxvbmcgbmFtZSBndXN0byBrb25nIG1hdHV0b25nIG1hZ2RyaXZlIiwiTWljaGFlbCBTZWJiaW5zIiwiUnViaWNvTl9TIiwiTWlrZSBUcnVrIiwiQmVubmV0dCBGb2RkeSIsIkNhdGhlcmluZSIsIlRvbW15IFdpc2VhdSIsIkR3aWd0IFJvcnR1Z2FsIiwiQiBMYXNhZ25hIiwiUm9iaW4gV3UiLCJHb3Jkb24gUmFtc2F5IiwiVmlsb3JpYSIsIlpvcnJvIiwiTG91ZWxsYSBDYWNlcyIsIlNsZXZlIE1jRGljaGFlbCIsImNhbWVsQ2FzZUFWZXJ5VmVyeUxvbmdOYW1lR3VzdG9Lb25nTWF0dXRvbmdNYWdkcml2ZSIsIkJlYWNoIExhc2FnbmEiLCJLaXp1bmEgQUkiLCJDaGVmRm9yY2VzIiwiUG9wcHkgSGFybG93Iiwia2ViYWItY2FzZS1hLXZlcnktdmVyeS1sb25nLW5hbWUtZ3VzdG8ta29uZy1tYXR1dG9uZy1tYWdkcml2ZSIsIkt1cnVtaSJd"

var search = new URLSearchParams(window.location.search);
var missing = search && search.get("missing") ? parseInt(search.get("missing")) : 0;

let names = [
    "dan", "cj", "franz", "andrew",
    "dan2", "cj2", "franz2", "andrew2",
    "dan3", "cj3", "franz3", "andrew3",
    "dan4", "cj4", "franz4", "andrew4",
]

let sampleContestants = []

let xattr = {};
let xdiff = {};
let xexpo = {};
let xskor = {};

let xeager = {};
let xskill = {};

for (const group of probgroups) {
    for (const prob of group.names) {
        xattr[prob] = 0.01 + 0.11 * Math.random() * Math.random() * Math.random();
        xdiff[prob] = 0.01 + 0.95 * Math.random();
        xexpo[prob] = 0.5 + 1.5 * Math.random();
        xskor[prob] = 0.1 + 1.4 * Math.random();
    }
}

function bago(name) {
    let subs = {};
    for (const group of probgroups) {
        for (const prob of group.names) {
            subs[prob] = {
                score: -1,
                penalty: 0,
            };
        }
    }
    xeager[name] = 1 + 10 * Math.random();
    xskill[name] = 1 + 10 * Math.random() * Math.random();
    return {name, subs};
}

function solb(contestant, att = 1000) {
    let name = contestant.name;
    let subs = contestant.subs;
    let changed = false;
    for (let i = 0; !changed && i < att; i++) {
        // alert(`HEYA ${i}`);
        for (const group of probgroups) {
            for (const prob of group.names) {
                if (Math.random() < xeager[name] * xattr[prob]) {
                    changed = true;
                    if (subs[prob].score == -1) subs[prob].score = 0;
                    if (subs[prob].score < 100 && Math.pow(Math.random(), xexpo[prob]) < xskill[name] * xdiff[prob]) {
                        subs[prob].score += 1 + Math.round(Math.pow(Math.random(), 1 / xskor[prob]) * (100 - 1 - subs[prob].score));
                        subs[prob].penalty += Math.round(Math.random() * Math.min(500, 10000 - subs[prob].penalty));
                    }
                }
            }
        }
    }
    return changed;
}

for (const name of names) {
    sampleContestants.push(bago(name))
}
for (const cont of sampleContestants) {
    var atts = 1 + 3 * Math.random();
    for (let i = 0; i < atts; i++) solb(cont);
}


Vue.filter('hmPenalty', function(penalty) {
    var h = Math.floor(penalty / 60);
    var m = penalty - 60 * h;
    var p = m < 10 ? "0" : "";
    return `${h}:${p}${m}`;
})

var nohilit = search && search.get("nohilit") ? parseInt(search.get("nohilit")) : 0;

var index = 0, pos = 0;
var scoreboard = new Vue({
    el: '#leaderboard',
    data: {
        problems: [],
        contestants: [],
        oldContestants: [],
        showPenalty: true,
        rankRules: [
            {rank: 1, color: "#ffd700"},
            {rank: 3, color: "#c0c0c0"},
            {rank: 6, color: "#cd7f32"},
        ],
        nohilit,
        missing,
    },
    created() {
        this.problems = sampleProblems;
        this.contestants = sampleContestants;
        this.fixLeaderboard();
    },
    computed: {
        problemList() {
            var lst = [];
            for (var g = 0; g < this.problems.length; g++) {
                for (var j = 0; j < this.problems[g].probs.length; j++) {
                    this.problems[g].probs[j].g = g;
                    lst.push(this.problems[g].probs[j]);
                }
            }
            return lst;
        },
        maxScore() {
            var maxScore = 0;
            for (var g = 0; g < this.problems.length; g++) {
                for (var i = 0; i < this.problems[g].probs.length; i++) {
                    maxScore += this.problems[g].probs[i].max_score;
                }
            }
            return Math.max(1, maxScore);
        },
        maxPenalty() {
            var maxPenalty = 0;
            for (var i = 0; i < this.contestants.length; i++) {
                maxPenalty = Math.max(maxPenalty, this.contestants[i].penalty);
            }
            return Math.max(1, maxPenalty);
        }
    },
    methods: {
        fixLeaderboard() {
            var a = this.contestants = this.contestants.slice();
            // recompute subs and penalty
            for (var i = 0; i < a.length; i++) {
                var t = 0, pt = 0;
                for (var g = 0; g < this.problems.length; g++) {
                    var pm = 0;
                    for (var j = 0; j < this.problems[g].probs.length; j++) {
                        t += Math.max(0, a[i].subs[this.problems[g].probs[j].name].score);
                        pm = Math.max(pm, a[i].subs[this.problems[g].probs[j].name].penalty);
                    }
                    pt += pm;
                }
                a[i].score = t;
                a[i].penalty = pt;
            }

            // sort
            a.sort(function(x, y) {
                if (x.score != y.score) return y.score - x.score;
                return x.penalty - y.penalty;
            });

            // recompute ranks
            for (var i = 0, r = 0; i < a.length; i++) {
                if (i == 0 || a[i - 1].score != a[i].score || a[i - 1].penalty != a[i].penalty) r = i + 1;
                a[i].rank = r;
            }
        },
        tColorForScore(score) {
            if (!this.missing && score == -1) return "#757575";
            return "";
        },
        colorForScore(score) {
            if (!this.missing && score == -1) return "rgba(222, 222, 222, 0.333)";
            score = Math.max(score, 0) / 100;
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
            for (var i = 0; i < this.rankRules.length; i++) {
                if (rank <= this.rankRules[i].rank) return this.rankRules[i].color;
            }
            return "#eeeeee";
        },

        // setScore(problem, hacker, score, penalty, )

        // testing methods
        perturb(j) {
            if (j < 0) j = Math.floor(Math.pow(Math.random(), 1.0) * this.contestants.length);
            // update j
            solb(this.contestants[j]);
        },
        randomSolve() {
            for (let ok = false; !ok;) {
                for (const c of _.shuffle(this.contestants)) {
                    if (solb(c, 1)) {
                        ok = true; break;
                    }
                }
            }
            this.fixLeaderboard();
        },
        newGuy() {
            let name, xmor;
            if (typeof mor == "string") xmor = JSON.parse(atob(mor));
            if (xmor && typeof xmor == "object" && xmor.length && pos < xmor.length && Math.random() < 1/(5 + pos * pos * pos / 11 / 11)) {
                name = xmor[pos++];
            } else {
                name = `newGuy${index++}`;
            }
            this.contestants.push(bago(name));
            this.perturb(this.contestants.length - 1);
            this.fixLeaderboard();
        },
    },
    template: `
    <div :class="['container', nohilit ? 'nohilit' : 'hilit']">
        <div>
            <button class="perturb-button btn btn-primary" v-on:click="randomSolve">+ Random submit!</button>
            <button class="perturb-button btn" v-on:click="newGuy">+ Random new guy!</button>
        </div>
        <div>
            <table class="table table-borderless table-sm">
                <thead>
                    <tr class="table-head">
                        <th class="t-rank"></th>
                        <th class="t-name"></th>
                        <th class="t-score"></th>
                        <th class="t-penalty" v-if="showPenalty"></th>
                        <th v-for="(probg, index) in problems" :class="['t-problem-group', 'group-label-' + index, 'group-label-par-' + (index % 2)]" :colspan="probg.probs.length" :key="probg.label">{{ probg.label }}</th>
                    </tr>
                    <tr class="table-head">
                        <th class="t-rank">Rank</th>
                        <th class="t-name">Name</th>
                        <th class="t-score">Score</th>
                        <th class="t-penalty" v-if="showPenalty">Penalty</th>
                        <th v-for="problem in problemList" :class="['t-problem', 'group-label-' + problem.g, 'group-label-par-' + (problem.g % 2)]"  :key="problem.name">{{ problem.name }}</th>
                    </tr>
                </thead>
                <transition-group name="leaderboard" tag="tbody">
                    <tr v-for="c in contestants" :key="c.name">
                        <transition name="entry-value" mode="out-in">
                            <td class="t-rank" :key="c.rank" :style="{'background-color': colorForRank(c.rank)}">{{ c.rank }}</td>
                        </transition>
                        <td class="t-name"><div class="d-name">{{ c.name }}</div></td>
                        <transition name="entry-value" mode="out-in">
                            <td class="t-score" :key="c.score" :style="{'background-color': colorForTotalScore(c.score)}">{{ c.score }}</td>
                        </transition>
                        <transition name="entry-value" mode="out-in">
                            <td class="t-penalty" :key="c.penalty" v-if="showPenalty" :style="{'background-color': colorForPenalty(c.penalty)}">{{ c.penalty | hmPenalty }}</td>
                        </transition>
                        <transition name="entry-value" mode="out-in" v-for="prob in problemList" :key="prob.name">
                            <td class="t-problem" :key="c.subs[prob.name].score" :style="{'background-color': colorForScore(c.subs[prob.name].score), 'color': tColorForScore(c.subs[prob.name].score)}">{{ c.subs[prob.name].score | score(missing) }} </td>
                        </transition>
                    </tr>
                </transition-group>
            </table>
        </div>
    </div>
    `
});
