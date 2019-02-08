var probnames = ["A lol foo", "B hey fool", "C hey bar", "D hey barl", "E lol foo", "F hey fool", "G hey bar", "H hey barl", "I lol", "J zorz"]
var probs = [];
for (var i = 0; i < probnames.length; i++) {
    probs.push({
        name: probnames[i],
        max_score: 100,
    });
}

function makeTempContestant(name, penalty, subs) {
    if (probs.length != subs.length) {
        throw "Invalid subs. Unequal lengths";
    }

    var sc = {};
    for (var i = 0; i < subs.length; i++) {
        sc[probs[i].name] = {
            score: subs[i],
            penalty: penalty,
        };
    }
    return {
        name: name,
        subs: sc,
    };
}
var contestants = [
        makeTempContestant("dan", 305, [0, 70, 0, 5, 1, 10, 0, 0, 0, 0]),
        makeTempContestant("cj", 550, [20, 0, 5, 0, 1, 0, 0, 0, 0, 10]),
        makeTempContestant("franz", 210, [10, 5, 0, 0, 0, 10, 80, 0, 0, 50]),
        makeTempContestant("andrew", 5, [5, 20, 0, 0, 51, 10, 0, 0, 0, 0]),
        makeTempContestant("dan2", 105, [80, 70, 0, 5, 21, 10, 0, 90, 10, 0]),
        makeTempContestant("cj2", 250, [60, 0, 5, 100, 31, 70, 0, 0, 0, 0]),
        makeTempContestant("franz2", 210, [0, 5, 100, 0, 0, 0, 50, 0, 0, 0]),
        makeTempContestant("andrew2", 77, [5, 20, 100, 100, 51, 60, 100, 90, 0, 0]),
        makeTempContestant("dan3", 365, [80, 70, 100, 35, 41, 10, 60, 100, 0, 0]),
        makeTempContestant("cj3", 350, [60, 100, 5, 100, 41, 70, 0, 100, 0, 0]),
        makeTempContestant("franz3", 10, [30, 5, 100, 70, 100, 10, 50, 80, 100, 100]),
        makeTempContestant("andrew3", 705, [5, 20, 100, 100, 71, 10, 80, 90, 95, 80]),
    ]

var index = 0;
var vm = new Vue({
    el: '#leaderboard',
    data: {
        problems: probs,
        contestants: contestants,
        oldContestants: [],
        showPenalty: true,
        rankRules: [
            {rank: 1, color: "#ffd700"},
            {rank: 3, color: "#c0c0c0"},
            {rank: 6, color: "#cd7f32"},
        ],
        maxScore: 0,
    },
    created() {
        this.fixLeaderboard();
    },
    methods: {
        fixLeaderboard() {
            var a = this.contestants = this.contestants.slice();
            // recompute subs and penalty
            for (var i = 0; i < a.length; i++) {
                var t = 0, p = 0;
                for (var j = 0; j < this.problems.length; j++) {
                    t += a[i].subs[this.problems[j].name].score;
                    p = Math.max(p, a[i].subs[this.problems[j].name].penalty);
                }
                a[i].score = t;
                a[i].penalty = p;
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

            this.maxScore = 0;
            for (var i = 0; i < this.problems.length; i++) {
                this.maxScore += this.problems[i].max_score;
            }
            this.maxScore = Math.max(1, this.maxScore);
        },
        colorForScore(score) {
            score /= 100;
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
            var maxPenalty = penalty;
            for (var i = 0; i < this.contestants.length; i++) {
                maxPenalty = Math.max(maxPenalty, this.contestants[i].penalty);
            }
            penalty /= maxPenalty;
            var g = Math.round(255 * (1 - 0.5 * penalty));
            return `rgba(${g}, ${g}, ${g}, 0.333)`
        },
        hmPenalty(penalty) {
            var h = Math.floor(penalty / 60);
            var m = penalty - 60 * h;
            var p = m < 10 ? "0" : "";
            return `${h}:${p}${m}`;
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
            var a = this.contestants;
            if (j < 0) j = Math.floor(Math.pow(Math.random(), 1.4) * this.contestants.length);
            // update j
            for (var changed = false; !changed; ) {
                for (var k = 0; k < this.problems.length; k++) {
                    if (Math.random() < 0.1) {
                        changed = true;
                        this.contestants[j].subs[this.problems[k].name].score += Math.round(Math.random() * (this.problems[k].max_score - this.contestants[j].subs[this.problems[k].name].score));
                        this.contestants[j].subs[this.problems[k].name].penalty += Math.round(Math.random() * Math.min(500, 10000 - this.contestants[j].subs[this.problems[k].name].penalty));
                    }
                }
            }
            return a;
        },
        randomSolve() {
            this.perturb(-1);
            this.fixLeaderboard();
        },
        newGuy() {
            var subs = {};
            for (var i = 0; i < this.problems.length; i++) {
                subs[this.problems[i].name] = {
                    score: 0,
                    penalty: 0,
                };
            }
            this.contestants.push({
                name: `newGuy${index}`,
                subs: subs,
            })
            index++;
            this.perturb(this.contestants.length - 1);
            this.fixLeaderboard();
        },
    },
    template: `
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm">
                <button class="btn btn-primary" v-on:click="randomSolve">Random solve!</button>
                <button class="btn btn-primary" v-on:click="newGuy">Random new guy!</button>
            </div>
        </div>
        <div class="row">
            <div class="col-sm">
                <table class="table table-borderless table-sm">
                    <thead>
                        <tr class="table-head">
                            <th class="t-rank">Rank</th>
                            <th class="t-name">Name</th>
                            <th class="t-score">Score</th>
                            <th class="t-penalty" v-if="showPenalty">Penalty</th>
                            <th class="t-problem" v-for="problem in problems">{{ problem.name }}</th>
                        </tr>
                    </thead>
                    <transition-group name="leaderboard" tag="tbody">
                        <tr v-for="c in contestants" v-bind:key="c.name">
                            <transition name="entry-value" mode="out-in">
                                <td class="t-rank" :key="c.rank" v-bind:style="{'background-color': colorForRank(c.rank)}">{{ c.rank }}</td>
                            </transition>
                            <td clsas="t-name">{{ c.name }}</td>
                            <transition name="entry-value" mode="out-in">
                                <td class="t-score" :key="c.score" v-bind:style="{'background-color': colorForTotalScore(c.score)}">{{ c.score }}</td>
                            </transition>
                            <transition name="entry-value" mode="out-in">
                                <td class="t-penalty" :key="c.penalty" v-if="showPenalty" v-bind:style="{'background-color': colorForPenalty(c.penalty)}">{{ hmPenalty(c.penalty) }}</td>
                            </transition>
                            <transition name="entry-value" mode="out-in" v-for="prob in problems">
                                <td class="t-problem" :key="c.subs[prob.name].score" v-bind:style="{'background-color': colorForScore(c.subs[prob.name].score)}">{{ c.subs[prob.name].score }} </td>
                            </transition>
                        </tr>
                    </transition-group>
                </table>
            </div>
        </div>
    </div>
    `
});
