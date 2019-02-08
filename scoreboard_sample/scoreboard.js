function perturb(a) {
    var j = Math.floor(Math.pow(Math.random(), 1.4) * a.length);
    // update j
    for (var changed = false; !changed; ) {
        for (var k = 0; k < a[j].scores.length; k++) {
            if (Math.random() < 0.1) { changed = true; a[j].scores[k] += Math.round(Math.random() * (100 - a[j].scores[k])); }
        }
    }
    a[j].penalty += Math.round(Math.random() * Math.min(500, 10000 - a[j].penalty));
    return a;
}

function fixLeaderboard(a) {
    // recompute scores
    for (var i = 0; i < a.length; i++) {
        var t = 0;
        for (var j = 0; j < a[i].scores.length; j++) t += a[i].scores[j];
        a[i].score = t;
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
    return a;
}


var vm = new Vue({
  el: '#leaderboard',
  data: {
    problems: ["A lol foo", "B hey fool", "C hey bar", "D hey barl", "E lol foo", "F hey fool", "G hey bar", "H hey barl", "I lol", "J zorz"],
    contestants: fixLeaderboard([
        {name: "dan", penalty: 305, scores: [0, 70, 0, 5, 1, 10, 0, 0, 0, 0]},
        {name: "cj", penalty: 550, scores: [20, 0, 5, 0, 1, 0, 0, 0, 0, 10]},
        {name: "franz", penalty: 210, scores: [10, 5, 0, 0, 0, 10, 80, 0, 0, 50]},
        {name: "andrew", penalty: 5, scores: [5, 20, 0, 0, 51, 10, 0, 0, 0, 0]},
        {name: "dan2", penalty: 105, scores: [80, 70, 0, 5, 21, 10, 0, 90, 10, 0]},
        {name: "cj2", penalty: 250, scores: [60, 0, 5, 100, 31, 70, 0, 0, 0, 0]},
        {name: "franz2", penalty: 210, scores: [0, 5, 100, 0, 0, 0, 50, 0, 0, 0]},
        {name: "andrew2", penalty: 77, scores: [5, 20, 100, 100, 51, 60, 100, 90, 0, 0]},
        {name: "dan3", penalty: 365, scores: [80, 70, 100, 35, 41, 10, 60, 100, 0, 0]},
        {name: "cj3", penalty: 350, scores: [60, 100, 5, 100, 41, 70, 0, 100, 0, 0]},
        {name: "franz3", penalty: 10, scores: [30, 5, 100, 70, 100, 10, 50, 80, 100, 100]},
        {name: "andrew3", penalty: 705, scores: [5, 20, 100, 100, 71, 10, 80, 90, 95, 80]},
    ]),
    oldContestants: [],
    showPenalty: true,
  },
  methods: {
    perturb: function () { // sort by rank
        this.contestants = fixLeaderboard(perturb(this.contestants.slice()));
    },
    colorForScore: function(score) {
        score /= 100;
        if (score <= 0.5) {
            var gr = Math.round(255 * 2 * score);
            return `rgba(255, ${gr}, 0, 0.333)`
        } else {
            var rd = Math.round(255 * 2 * (1 - score))
            return `rgba(${rd}, 255, 0, 0.333)`
        }
    },
    colorForTotalScore: function(score) {
        score /= 100 * this.problems.length;
        var rb = Math.round(255 * (1 - score));
        return `rgba(${rb}, 255, ${rb}, 0.333)`
    },
    colorForPenalty: function(penalty) {
        var maxPenalty = penalty;
        for (var i = 0; i < this.contestants.length; i++) {
            maxPenalty = Math.max(maxPenalty, this.contestants[i].penalty);
        }
        penalty /= maxPenalty;
        var g = Math.round(255 * (1 - 0.5 * penalty));
        return `rgba(${g}, ${g}, ${g}, 0.333)`
    },
    hmPenalty: function(penalty) {
        var h = Math.floor(penalty / 60);
        var m = penalty - 60 * h;
        var p = m < 10 ? "0" : "";
        return `${h}:${p}${m}`;
    },
    colorForRank: function(rank) {
        if (rank <= 1) return "#ffd700";
        if (rank <= 3) return "#c0c0c0";
        if (rank <= 6) return "#cd7f32";
        return "#eeeeee";
    }
  },
  template: `
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm">
                <button class="btn btn-primary" v-on:click="perturb">Random solve!</button>
            </div>
        </div>
        <div class="row">
            <div class="col-sm">
                <table class="table table-borderless table-sm">
                    <thead>
                        <tr class="table-head">
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Score</th>
                            <th v-if="showPenalty">Penalty</th>
                            <th v-for="problem in problems">{{ problem }}</th>
                        </tr>
                    </thead>
                    <transition-group name="leaderboard" tag="tbody">
                        <tr v-for="c in contestants" v-bind:key="c.name">
                            <transition name="entry-value" mode="out-in">
                                <td :key="c.rank" v-bind:style="{'background-color': colorForRank(c.rank)}">{{ c.rank }}</td>
                            </transition>
                            <td>{{ c.name }}</td>
                            <transition name="entry-value" mode="out-in">
                                <td :key="c.score" v-bind:style="{'background-color': colorForTotalScore(c.score)}">{{ c.score }}</td>
                            </transition>
                            <transition name="entry-value" mode="out-in">
                                <td :key="c.penalty" v-if="showPenalty" v-bind:style="{'background-color': colorForPenalty(c.penalty)}">{{ hmPenalty(c.penalty) }}</td>
                            </transition>
                            <transition name="entry-value" mode="out-in" v-for="score in c.scores">
                                <td :key="score" v-bind:style="{'background-color': colorForScore(score)}">{{ score }}</td>
                            </transition>
                        </tr>
                    </transition-group>
                </table>
            </div>
        </div>
    </div>
  `
});
