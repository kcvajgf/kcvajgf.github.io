// by Kevin Atienza
var $scoreboard = null;

// curl stands for 'contestUrl'


var initScoreboard = (() => {
    const currentYear = 2020;
    const currentYearContests = [
            "noielims",
            "noifinalspractice",
            "noifinals1",
            "noifinals2",
            "noiteam",
        ];

    // attempts to collect a list by making several requests. assumes that 'limit' is limited by the server.
    // TODO unify into a single fetchWhile
    async function fetchWhileFrom(url, params, limit, getListFrom) {
        let result = []
        if (limit > 0) {
            params.count = limit;
            for (params.from = 1;; params.from += params.count) {
                const res = getListFrom((await axios.get(url, { params, timeout: 60000 })).data);
                if (res) result = result.concat(res);
                if (!res || res.length < params.count) break; // we've reached the end.
            };
        } else {
            const res = getListFrom((await axios.get(url, { params, timeout: 60000 })).data);
            result = result.concat(res);
        }
        return result;
    }
    async function fetchWhileOffset(url, params, limit, getListFrom) {
        let result = []
        if (limit > 0) {
            params.limit = limit;
            for (params.offset = 0;; params.offset += params.limit) {
                const res = getListFrom((await axios.get(url, { params, timeout: 60000 })).data);
                if (res) result = result.concat(res);
                if (!res || res.length < params.limit) break; // we've reached the end.
            };
        } else {
            const res = getListFrom((await axios.get(url, { params, timeout: 60000 })).data);
            result = result.concat(res);
        }
        return result;
    }

    function makeHRGetter(contestDataParams, problemDataParams) {
        return (options) => {

            let groups = null;

            async function getContestData(curl) {
                const reqData = contestDataParams(curl)
                const raw = await fetchWhileOffset(
                    reqData.url,
                    reqData.params,
                    reqData.limit,
                    (x) => x.models
                );
                const cleaned = [];
                for (const rawProb of raw) {
                    cleaned.push({
                        maxScore: rawProb.max_score,
                        slug: rawProb.slug,
                        contestSlug: rawProb.contest_slug,
                        name: rawProb.name,
                        id: `HR..${curl}..${rawProb.slug}`,
                    });
                }
                return cleaned;
            }

            async function getProblemData(cslug, slug) {
                const reqData = problemDataParams(cslug, slug);
                const raw = await fetchWhileOffset(
                    reqData.url,
                    reqData.params,
                    reqData.limit,
                    (x) => x.models
                );
                const cleaned = [];
                for (const rawSub of raw) {
                    if (rawSub.hacker != "[deleted]") {
                        cleaned.push({
                            contestantName: rawSub.hacker,
                            score: parseFloat(rawSub.score),
                            penalty: parseFloat(rawSub.time_taken),
                        });
                    };
                }
                return cleaned;
            }


            async function fetchProblemSubs(problem, proc) {
                console.log("Fetching", problem.contestSlug, problem.slug);

                let gotSubs = {};

                let subs = []
                let cslugs = [problem.contestSlug];
                let success = true;
                if (options.parallelContestURLs[problem.contestSlug]) {
                    cslugs = cslugs.concat(options.parallelContestURLs[problem.contestSlug]);
                }
                for (const cslug of cslugs) {
                    if (!success) break;
                    let gotSubs = await getProblemData(cslug, problem.slug).catch((x) => {
                        console.log(cslug, "Got error", x);
                        console.log(cslug, `Failed to fetch submission info for problem ${problem.slug}`,
                                `for contest ${cslug}. Please try again later.`);
                        success = false;
                    });
                    console.log(cslug, "Fetched", cslug, problem.slug);
                    if (gotSubs) subs = subs.concat(gotSubs);
                }
                if (!success) subs = null;

                // save to localStorage
                localStorage.setItem(`problem_${problem.id}`, JSON.stringify(subs));

                proc(problem, subs);
            }

            async function fetchProblemList() {
                let problemGroups = [];
                for (const url of options.curls) {
                    let key = `hrcontest_${url}`;
                    let probs = localStorage.getItem(key);
                    if (probs) {
                        console.log("Loading contest data", url, "from local storage");
                        probs = JSON.parse(probs);
                    } else {
                        console.log("Fetching contest data", url);
                        probs = await getContestData(url).catch((x) => {
                            console.error("Got error", x);
                            alert(`Failed to fetch problem info for ${url}. Please try again later.`);
                        });
                        if (probs) localStorage.setItem(key, JSON.stringify(probs))
                    }
                    console.log("Loaded contest data", url);
                    if (probs && probs.length) {
                        problemGroups.push({
                            label: url,
                            slug: url,
                            probs: probs,
                        });
                    }
                }
                groups = problemGroups;
                return problemGroups;
            }

            async function initFetchAll(proc) {
                let promises = [];
                for (const group of groups) {
                    for (const prob of group.probs) {
                        promises.push(initFetchProblem(prob, proc));
                    }
                }
                await Promise.all(promises);
            }

            async function initFetchProblem(prob, proc) {
                if (!prob) console.warn("WARNING: PROBLEM NOT FOUND");

                // load from localStorage
                let subs = localStorage.getItem(`problem_${prob.id}`);
                if (subs) {
                    console.log("Loading", prob.contestSlug, prob.slug, "from local storage");
                    subs = JSON.parse(subs);
                    proc(prob, subs);
                    console.log("Loaded", prob.contestSlug, prob.slug);
                } else {
                    await fetchProblemSubs(prob, proc);
                }
            }

            return {
                fetchProblemSubs,
                fetchProblemList,
                initFetchAll,
            };
        }
    }

    const HRKunoGetter = (() => {
        const hackerrank = "http://localhost:8003"
        function contestDataParams(cslug) {
            return {
                url: `${hackerrank}/rest/contests/${cslug}/challenges`,
                params: {
                    // cslug,
                },
                limit: 100,
            }
        }

        function problemDataParams(cslug, slug) {
            return {
                url: `${hackerrank}/rest/contests/${cslug}/challenges/${slug}/leaderboard`,
                params: {
                    // cslug,
                    // slug,
                },
                limit: 100,
            }
        }
        return makeHRGetter(contestDataParams, problemDataParams);
    })();

    const HRGetter = (() => {
        const hackerrank = "https://www.hackerrank.com" // cannot use due to CORS restriction
        function contestDataParams(cslug) {
            return {
                url: `${hackerrank}/rest/contests/${cslug}/challenges`,
                params: {
                    // cslug,
                },
                limit: 100,
            }
        }

        function problemDataParams(cslug, slug) {
            return {
                url: `${hackerrank}/rest/contests/${cslug}/challenges/${slug}/leaderboard`,
                params: {
                    // cslug,
                    // slug,
                },
                limit: 100,
            }
        }
        return makeHRGetter(contestDataParams, problemDataParams);
    })();

    const HRAzureGetter = (() => {
        function contestDataParams(cslug) {
            return {
                url: `contests/${cslug}.json`,
                params: {},
                limit: -1,
            }
        }

        function problemDataParams(cslug, slug) {
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

        return makeHRGetter(contestDataParams, problemDataParams);
    })();


    const CFGetter = ((options) => {
        const codeforces = "http://localhost:8003"
        // const codeforces = "https://codeforces.com"


        async function getContestData(contestId) {
            let rawProblems = null;
            const rawRows = await fetchWhileFrom(
                `${codeforces}/api/contest.standings`,
                {
                    contestId: contestId,
                },
                400,
                (x) => {
                    rawProblems = x.result.problems;
                    return x.result.rows;
                }
            );

            const cleanedProblems = [];
            for (const rawProb of rawProblems) {
                cleanedProblems.push({
                    maxScore: rawProb.points,
                    slug: rawProb.index,
                    name: rawProb.name,
                    id: `CF..${contestId}..${rawProb.index}`,
                });
            }

            const problemData = {};
            for (const prob of cleanedProblems) {
                problemData[prob.id] = {
                    prob: prob,
                    subs: [],
                };
            }

            for (const row of rawRows) {
                const name = row.party.members[0].handle;
                for (let i = 0; i < cleanedProblems.length; i++) {
                    const prob = cleanedProblems[i];
                    const res = row.problemResults[i];
                    const score = parseFloat(res.points);
                    const rejects = parseInt(res.rejectedAttemptCount);
                    const penalty = score > 0 ? parseFloat(res.bestSubmissionTimeSeconds)/60 : 0;
                    if (rejects > 0 || score > 0) {
                        problemData[prob.id].subs.push({
                            contestantName: name,
                            score: score,
                            penalty: penalty,
                        })
                    }
                }
            }

            return {problems: cleanedProblems, problemData};
        }

        let everythings = {};
        async function fetchProblemList() {
            let problemGroups = [];
            for (let i = 0; i < options.curls.length; i++) {
                const url = options.curls[i];
                const contestId = options.cfContestIDs[i];
                let key = `cfcontest_${contestId}`;
                let everything = localStorage.getItem(key);
                if (everything) {
                    console.log("Loading everything", url, "from local storage");
                    everything = JSON.parse(everything);
                } else {
                    console.log("Fetching everything", url);
                    everything = await getContestData(contestId).catch((x) => {
                        console.error("Got error", x);
                        alert(`Failed to fetch everything for ${contestId} (${url}). Please try again later.`);
                    });
                    if (everything) localStorage.setItem(key, JSON.stringify(everything));
                }

                if (everything.problems && everything.problems.length) {
                    problemGroups.push({
                        label: url,
                        slug: url,
                        contestId: contestId,
                        probs: everything.problems,
                    })
                }

                everythings[contestId] = everything;
            }

            return problemGroups;
        }


        async function fetchProblemSubs(problem, proc) {
            for (const contestId in everythings) {
                let key = `cfcontest_${contestId}`;

                console.log("Fetching everything contest ID", contestId);
                let everything = await getContestData(contestId).catch((x) => {
                    console.log(contestId, "Got error", x);
                    console.log(contestId, `Failed to fetch everything for ${contestId}.`,
                            ` Please try again later.`);
                });

                // save to localStorage
                if (everything) localStorage.setItem(key, JSON.stringify(everything));

                everythings[contestId] = everything;

                for (const probId in everything.problemData) {
                    const probData = everything.problemData[probId];
                    proc(probData.prob, probData.subs);
                }
            };
        }

        async function initFetchAll(proc) {
            for (const contestId in everythings) {
                const everything = everythings[contestId];
                for (const probId in everything.problemData) {
                    const probData = everything.problemData[probId];
                    proc(probData.prob, probData.subs);
                }
            }
            return Promise.resolve();
        }

        return {
            fetchProblemSubs,
            fetchProblemList,
            initFetchAll,
        }
    });


    // helpers
    Vue.filter('hmPenalty', function(penalty, fixed) {
        const h = Math.floor(penalty / 60);
        const m = (penalty - 60 * h).toFixed(fixed);
        const p = m < 10 ? "0" : "";
        return `${h}:${p}${m}`;
    })

    function isclose(a, b) {
        return Math.abs(a - b) / Math.max(1, Math.max(Math.abs(a), Math.abs(b))) <= 1e-5;
    }

    Vue.filter('score', function(score, maxD) {
        if (score == -1) return ".";
        score /= 1;
        let fixed = 0;
        while (fixed < maxD && !isclose(score, +score.toFixed(fixed))) fixed++;
        return score == -1 ? "." : score.toFixed(fixed);
    })

    let rankRuleses = {
        "noielims": [
            {rank: 30, color: "#00cc00"},
        ],
        "noielims2016": [
            {rank: 20, color: "#00cc00"},
        ],
        "noifinals2019": [
            {rank: 1, color: "#ffd700"},
            {rank: 3, color: "#c0c0c0"},
            {rank: 6, color: "#cd7f32"},
            {rank: 10, color: "#00bb00"},
        ],
        "noifinals": [
            {rank: 1, color: "#ffd700"},
            {rank: 3, color: "#c0c0c0"},
            {rank: 6, color: "#cd7f32"},
            {rank: 15, color: "#00bb00"},
        ],
        "noiteam": [
            {rank: 4, color: "#00cc00"},
        ],
        "generic": [],
    }

    function getContestDetails() {
        const search = new URLSearchParams(window.location.search);
        let ruleType = search.get("type") || "generic";
        let pastCurls = search && search.get("past") ? search.get("past").split(",") : [];
        let fetchCurls = search && search.get("fetch") ? search.get("fetch").split(",") : [];
        let rankRules = rankRuleses[ruleType];
        let cfContestIDs = search && search.get("ids") ? search.get("ids").split(",") : [];
        const penaltyFixed = search && search.get("pd") ? parseInt(search.get("pd")) : 0;
        const tScoreMax = search && search.get("td") ? parseInt(search.get("td")) : 2;
        const scoreMax = search && search.get("sd") ? parseInt(search.get("sd")) : 2;
        const nohilit = search && search.get("nohilit") ? parseInt(search.get("nohilit")) : 0;
        const showBlank = search && search.get("showblank") ? parseInt(search.get("showblank")) : 0;
        const contest = search && search.get("contest") || null;
        const contestYear = search && search.get("year") ? parseInt(search.get("year")) : currentYear;
        let fromCF = contestYear >= 2020;
        const parallelContestURLs = {
            "noi-ph-2018-team": ["noi-ph-2018-team-early"],
            "noi-ph-2017-team": ["noi-ph-2017-team-early"],
        };

        for (let i = 0; i < cfContestIDs.length; i++) {
            cfContestIDs[i] = parseInt(cfContestIDs[i]);
        }

        if (contest) {
            const base = `noi-ph-${contestYear}`;
            if (contest == "noielims") {
                if (contestYear == 2015) {
                    pastCurls = [`${base}-1`, `${base}-2`];
                    fetchCurls = [];
                    rankRules = rankRuleses["noielims2016"];
                } else if (contestYear == 2016) {
                    pastCurls = [`${base}-1`, `${base}-2`, `${base}-3`];
                    fetchCurls = [];
                    rankRules = rankRuleses["noielims2016"];
                } else {
                    pastCurls = [];
                    fetchCurls = [base];
                    rankRules = rankRuleses["noielims"];
                }
            } else if (contest == "noifinalspractice") {
                pastCurls = [];
                fetchCurls = [`${base}-finals-practice`];
                rankRules = rankRuleses[contestYear <= 2019 ? "noifinals2019" : "noifinals"];
            } else if (contest == "noifinals1") {
                pastCurls = [];
                fetchCurls = [`${base}-finals-1`];
                rankRules = rankRuleses[contestYear <= 2019 ? "noifinals2019" : "noifinals"];
            } else if (contest == "noifinals2") {
                pastCurls = [`${base}-finals-1`];
                fetchCurls = [`${base}-finals-2`];
                rankRules = rankRuleses[contestYear <= 2019 ? "noifinals2019" : "noifinals"];
            } else if (contest == "noiteam") {
                if (contestYear == 2015) {
                    pastCurls = [];
                    fetchCurls = [`${base}-finals-2`];
                    rankRules = rankRuleses["noiteam"];
                } else {
                    pastCurls = [];
                    fetchCurls = [`${base}-team`];
                    rankRules = rankRuleses["noiteam"];
                }
            } else {
                alert(`Unknown contest ${contest}`);
                throw `Unknown contest ${contest}`;
            }
            if (contestYear != currentYear || !currentYearContests.includes(contest)) {
                pastCurls = pastCurls.concat(fetchCurls);
                fetchCurls = [];
            }
        }

        console.log("got details", fetchCurls, pastCurls, rankRules);
        if (!rankRules) {
            alert(`Unknown 'type' ${ruleType}.`);
            rankRules = [];
        }

        let fetchInterval = fromCF ? 31111 : 6111;
        if (fromCF && cfContestIDs.length == 0) {
            // TODO attempt to lookup a hardcoded list.
        }
        if (fromCF && cfContestIDs.length == 0) {
            alert(`Contest IDs missing. Please pass them as URL params`);
        }

        const curls = pastCurls.concat(fetchCurls);

        let getter;
        if (fromCF) {
            getter = CFGetter({curls, cfContestIDs});
        } else {
            // getter = HRGetter({parallelContestURLs, curls});    
            getter = HRKunoGetter({parallelContestURLs, curls});    
            // getter = HRAzureGetter({parallelContestURLs, curls});
        }

        return {
            getter,
            rankRules,
            penaltyFixed,
            tScoreMax,
            scoreMax,
            nohilit,
            showBlank,
            pastCurls,
            fetchCurls,
            curls,
            fetchInterval,
        };
    }

    function initScoreboard() {
        const contestDetails = getContestDetails();
        const vm = new Vue({
            el: '#scoreboard',
            data: {
                problemGroups: [],
                contestants: [],
                loadedProblem: {},

                showPenalty: true,
                startedFetchLoop: false,
                fetchInterval: contestDetails.fetchInterval,

                getter: contestDetails.getter,
                pastCurls: contestDetails.pastCurls,
                fetchCurls: contestDetails.fetchCurls,
                curls: contestDetails.curls,
                rankRules: contestDetails.rankRules,
                penaltyFixed: contestDetails.penaltyFixed,
                tScoreMax: contestDetails.tScoreMax,
                scoreMax: contestDetails.scoreMax,
                nohilit: contestDetails.nohilit,
                showBlank: contestDetails.showBlank,
            },
            async mounted() {
                this.$el.classList.add("board-loading");

                await this.initFetchAll();

                this.fix(); // not needed?

                setTimeout(() => {
                    this.$el.classList.remove("board-loading");
                    this.$el.classList.add("board-created");
                }, 1000);

                this.startFetchLoop();
            },
            computed: {
                problemList() {
                    let problemList = [];
                    for (let g = 0; g < this.problemGroups.length; g++) {
                        for (const prob of this.problemGroups[g].probs) {
                            prob.g = g;
                            problemList.push(prob);
                        }
                    }
                    return problemList;
                },

                maxScore() {
                    let maxScore = 0;
                    for (const problem of this.problemList) {
                        maxScore += problem.maxScore;
                    }
                    return Math.max(1, maxScore);
                },

                nameContestant() {
                    let nameContestant = {};
                    for (const contestant of this.contestants) {
                        nameContestant[contestant.name] = contestant;
                    }
                    return nameContestant;
                },

                maxPenalty() {
                    let maxPenalty = 1;
                    for (const contestant of this.contestants) {
                        maxPenalty = Math.max(maxPenalty, contestant.penalty);
                    }
                    return maxPenalty;
                },
            },

            methods: {
                setScore(problem, sub, fix = true) {
                    let contestant = this.getOrCreateContestant(sub.contestantName, false);
                    let csub = contestant.subs[problem.id];
                    csub.score = sub.score;
                    csub.penalty = sub.penalty;
                    if (fix) this.fix();
                },

                getOrCreateContestant(name, fix = true) {
                    let contestant = this.nameContestant[name];
                    if (contestant) return contestant;
                    // this is a new guy. create a new contestant
                    let subs = {};
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

                    if (!(this.fetchCurls && this.fetchCurls.length && this.problemGroups && this.problemGroups.length)) {
                        console.log("Empty problem groups. Not running fetch loop.");
                        return;
                    }

                    if (this.startedFetchLoop) {
                        console.log("Already started. Ignoring YOU!!!");
                        return;
                    }
                    this.startedFetchLoop = true;

                    while (true) {
                        let found = false;
                        for (const group of this.problemGroups) {
                            if (this.fetchCurls.includes(group.slug)) {
                                for (const prob of group.probs) {
                                    found = true;
                                    await new Promise(resolve => setTimeout(resolve, this.fetchInterval));
                                    await this.fetchProblem(prob).catch((e) => {
                                        console.log("Got error", e);
                                        console.log("Failed to load", prob.id,
                                                "! Never mind. I'll try again later.")
                                    });
                                }
                            }
                        }
                        if (!found) break;
                    }

                    console.log("Did not find anything to fetch. Stopping fetch loop.");
                    this.startedFetchLoop = false;
                },

                // fetches

                async fetchProblem(problem, fix = true) {
                    if (!problem) console.warn("WARNING: PROBLEM NOT FOUND!");
                    await this.getter.fetchProblemSubs(problem, (prob, subs) => {
                        this.processSubs(prob, subs);
                    });

                    if (fix) this.fix();
                },

                async initFetchAll() {
                    this.problemGroups = await this.getter.fetchProblemList();
                    await this.getter.initFetchAll((prob, subs) => {
                        this.processSubs(prob, subs, true);
                        this.loadedProblem[prob.id] = true;
                    });
                    this.fix();
                },

                processSubs(problem, subs, fix) {
                    if (subs) for (const sub of subs) {
                        this.setScore(problem, sub, false);
                    }
                    if (fix) this.fix();
                },

                // 'fix'
                recomputeAggregates() {
                    for (const contestant of this.contestants) {
                        let scoreTotal = 0, penaltyTotal = 0;
                        for (const group of this.problemGroups) {
                            let penaltyMax = 0;
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

                    for (let i = 0, rank = 0; i < this.contestants.length; i++) {
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
                    if (this.showBlank && score == -1) return `rgba(222, 222, 222, 0.333)`;
                    score = Math.max(score, 0) / maxScore;
                    let mgr = Math.round(180 * (1 - score));
                    return `rgba(${mgr}, 222, ${mgr}, 0.333)`;
                },
                colorForTotalScore(score) {
                    score /= this.maxScore;
                    let rb = Math.round(255 * (1 - score));
                    return `rgba(${rb}, 255, ${rb}, 0.333)`
                },
                colorForPenalty(penalty) {
                    penalty /= this.maxPenalty;
                    let g = Math.round(255 * (1 - 0.5 * penalty));
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
            <div :class="[
                    problemList.length <= 10 ? 'container' : 'container-fluid',
                    nohilit ? 'nohilit' : 'hilit']">
                <table class="table table-borderless table-sm">
                    <thead>
                        <tr class="table-head">
                            <th class="t-rank"></th>
                            <th class="t-name"></th>
                            <th class="t-score"></th>
                            <th class="t-penalty" v-if="showPenalty"></th>
                            <th v-for="(probg, index) in problemGroups"
                                    :key="probg.slug"
                                    :colspan="probg.probs.length"
                                    :class="['t-problem-group',
                                             'group-label-' + index,
                                             'group-label-par-' + (index % 2)]">
                                <small>{{ probg.label }}</small>
                            </th>
                        </tr>
                        <tr class="table-head">
                            <th class="t-rank">Rank</th>
                            <th class="t-name">Name</th>
                            <th class="t-score">Score</th>
                            <th class="t-penalty" v-if="showPenalty">Time</th>
                            <th class="t-problem-head t-problem"
                                    v-for="problem in problemList"
                                    :key="problem.slug"
                                    :class="['group-label-' + problem.g,
                                             'group-label-par-' + (problem.g % 2)]">
                                <button class="t-problem-link btn btn-sm"
                                        v-on:click="fetchProblem(problem)">
                                    <small>{{ problem.name }}</small>
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <transition-group name="scoreboard" tag="tbody">
                        <tr v-for="c in contestants" :key="c.name">
                            <transition name="entry-value" mode="out-in">
                                <td class="t-rank"
                                        :key="c.rank"
                                        :style="{'background-color': colorForRank(c.rank)}">
                                    {{ c.rank }}
                                </td>
                            </transition>
                            <td class="t-name"><div class="d-name">{{ c.name }}</div></td>
                            <transition name="entry-value" mode="out-in">
                                <td class="t-score"
                                        :key="c.score"
                                        :style="{'background-color': colorForTotalScore(c.score)}">
                                    {{ c.score | score(tScoreMax) }}
                                </td>
                            </transition>
                            <transition name="entry-value" mode="out-in">
                                <td class="t-penalty" :key="c.penalty" v-if="showPenalty"
                                        :style="{'background-color': colorForPenalty(c.penalty)}">
                                        <small>{{ c.penalty | hmPenalty(penaltyFixed) }}</small>
                                    </td>
                            </transition>
                            <transition name="entry-value"
                                    mode="out-in"
                                    v-for="prob in problemList"
                                    :key="prob.slug">
                                <td v-if="loadedProblem[prob.id]"
                                        class="t-problem"
                                        :key="c.subs[prob.id].score"
                                        :style="{
                                            'background-color':
                                                colorForScore(c.subs[prob.id].score, prob.maxScore),
                                            'color':
                                                tColorForScore(c.subs[prob.id].score, prob.maxScore)
                                        }">
                                    {{ c.subs[prob.id].score | score(scoreMax) }}
                                </td>
                                <td v-if="!loadedProblem[prob.id]"
                                        class="t-problem"
                                        :key="c.subs[prob.id].score"
                                        style="background-color: #bbf">
                                    Loading...
                                </td>
                            </transition>
                        </tr>
                    </transition-group>
                </table>
            </div>
            `
        });

        return $scoreboard = {vm};
    }

    return initScoreboard;
})()
