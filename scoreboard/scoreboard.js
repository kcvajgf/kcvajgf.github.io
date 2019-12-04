// by Kevin Atienza
var $scoreboard = null;

// options:
//     Contest URLs
//         'past', 'fetch' and 'source' for custom IOI-style contest combinations
//         'contest' and 'year' for predetermined NOI contests
//         If source=CF, need to pass 'ids'. |ids| = |past| + |fetch|
//     Extra options
//         'type' rank colors
//         'pd' (penalty digits) number of decimal points to display for time penalty
//         'nohilit' don't highlight on hover
//         'td' (total score digits) number of decimal points to display for total score
//         'sd' (score digits) number of decimal points to display for score
//         'blanks' distinguish 0 points from no attempts (in colors)

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
    async function fetchWhile(url, params, start, limit, offsetName, limitName, getListFrom) {
        let result = []
        if (limit > 0) {
            params[limitName] = limit;
            for (params[offsetName] = start;; params[offsetName] += limit) {
                const res = getListFrom((await axios.get(url, { params, timeout: 60000 })).data);
                if (res) result = result.concat(res);
                if (!res || res.length < limit) break; // we've reached the end.
            };
        } else {
            const res = getListFrom((await axios.get(url, { params, timeout: 60000 })).data);
            result = result.concat(res);
        }
        return result;
    }
    async function fetchWhileCF(url, params, limit, getListFrom) {
        return await fetchWhile(url, params, 1, limit, 'from', 'count', getListFrom);
    }
    async function fetchWhileHR(url, params, limit, getListFrom) {
        return await fetchWhile(url, params, 0, limit, 'offset', 'limit', getListFrom);
    }

    // curl stands for 'contestUrl'

    const DemoGetter = ((options) => {
        let rawProblemGroups = [
            {label: "Day 1", names: ["foo", "fool", "bar", "barl", "coo"]},
            {label: "Day 2", names: ["cool", "car", "carl", "lol", "zorz"]},
        ]

        let defaultContestants = [
            "matthew", "aldrich", "robin", "ian",
            "farrell", "maded", "franz", "kim",
            "dan", "cj", "andrew", "miko", "steven", "dion",
        ];

        var xmor = "WyJTdGV2ZW4gSGFsaW0iLCJDYXJsU2FnYW40MiIsIk1yTGxhbWFTQyIsIkEgdmVyeSB2ZXJ5IGxvbmcgbmFtZSBndXN0byBrb25nIG1hdHV0b25nIG1hZ2RyaXZlIiwiTWljaGFlbCBTdGViYmlucyIsIlJ1Ymljb05fUyIsIk1pa2UgVHJ1ayIsIkJlbm5ldHQgRm9kZHkiLCJDYXRoZXJpbmUiLCJUb21teSBXaXNlYXUiLCJEd2lndCBSb3J0dWdhbCIsIkIgTGFzYWduYSIsIlJvYmluIFd1IiwiR29yZG9uIFJhbXNheSIsIlZpbG9yaWEiLCJab3JybyIsIkxvdWVsbGEgQ2FjZXMiLCJTbGV2ZSBNY0RpY2hhZWwiLCJjYW1lbENhc2VBVmVyeVZlcnlMb25nTmFtZUd1c3RvS29uZ01hdHV0b25nTWFnZHJpdmUiLCJCZWFjaCBMYXNhZ25hIiwiS2l6dW5hIEFJIiwiQ2hlZkZvcmNlcyIsIlBvcHB5IEhhcmxvdyIsImtlYmFiLWNhc2UtYS12ZXJ5LXZlcnktbG9uZy1uYW1lLWd1c3RvLWtvbmctbWF0dXRvbmctbWFnZHJpdmUiLCJLdXJ1bWkiXQ=="
        let xpos = 0, xnewguy = 0;

        let xconts = [];
        let xprobs = [];

        let xcontData = {};
        let xprobData = {};

        let xsubs = {};
        function xinitContestant(name) {
            if (!name) {
                let mor;
                if (typeof xmor == "string") mor = JSON.parse(atob(xmor));
                if (mor && typeof mor == "object" && mor.length && xpos < mor.length && Math.random() < 1/(5 + xpos * xpos * xpos / 11 / 11)) {
                    name = mor[xpos++];
                } else {
                    name = `newGuy${xnewguy++}`;
                }
            }
            xconts.push(name);

            // set skill and stuff
            xcontData[name] = {
                eager: 1 + 10 * Math.random(),
                skill: 1 + 10 * Math.random() * Math.random(),
            }

            for (const probId of xprobs) {
                xsubs[probId][name] = {
                    score: -1,
                    penalty: 0,
                };
            }

            xSolve(name);
        }

        function xinitProblem(probId) {
            xprobs.push(probId);
            xsubs[probId] = {};

            // set difficulty and stuff
            xprobData[probId] = {
                attr: 0.01 + 0.11 * Math.random() * Math.random() * Math.random(),
                diff: 0.01 + 0.95 * Math.random(),
                expo: 0.5 + 1.5 * Math.random(),
                skor: 0.1 + 1.4 * Math.random(),
            };
        }

        function xSolve(name, att = 1000) {
            let xcont = xcontData[name];
            let changed = false;
            for (let i = 0; !changed && i < att; i++) {
                // alert(`HEYA ${i}`);
                for (const probId of xprobs) {
                    let xprob = xprobData[probId];
                    if (Math.random() < xcont.eager * xprob.attr) {
                        let xsub = xsubs[probId][name];
                        changed = true;
                        if (xsub.score == -1) xsub.score = 0;
                        if (xsub.score < 100 && Math.pow(Math.random(), xprob.expo) < xcont.skill * xprob.diff) {
                            xsub.score += 1 + Math.round(Math.pow(Math.random(), 1 / xprob.skor) * (100 - 1 - xsub.score));
                            xsub.penalty += Math.round(Math.random() * Math.min(500, 10000 - xsub.penalty));
                        }
                    }
                }
            }
            return changed;
        }

        function getProblemData(probId) {
            console.log("GETTING", probId);
            let res = [];
            for (const name of xconts) {
                res.push({
                    contestantName: name,
                    score: xsubs[probId][name].score,
                    penalty: xsubs[probId][name].penalty,
                });
            }
            return res;
        }

        let groups = null;
        async function fetchProblemList() {
            const problemGroups = [];
            for (const group of rawProblemGroups) {
                const probs = [];
                for (const name of group.names) {
                    let prob = {
                        maxScore: 100,
                        contestSlug: group.label,
                        slug: `${group.label}_${name}`,
                        name: name,
                        id: `DEMO..${group.label}..${name}`,
                    }
                    probs.push(prob);
                    xinitProblem(prob.id);
                }
                problemGroups.push({
                    label: group.label,
                    slug: group.label,
                    probs,
                })
            }

            // initialize contestants
            for (const name of defaultContestants) {
                xinitContestant(name);
            }

            return groups = problemGroups;
        }

        async function fetchProblemSubs(problem, proc) {
            console.log("Fetching", problem.contestSlug, problem.slug);

            let gotSubs = {};

            let cslug = problem.contestSlug;
            let subs = getProblemData(problem.id)
            proc(problem, subs || []);
        }

        async function initFetchProblem(prob, proc) {
            if (!prob) console.warn("WARNING: PROBLEM NOT FOUND");
            await fetchProblemSubs(prob, proc);
        }

        async function initFetchAll(proc) {
            for (const group of groups) {
                for (const prob of group.probs) {
                    initFetchProblem(prob, proc);
                }
            }
        }

        function randomSolve() {
            while (true) {
                for (const c of _.shuffle(xconts)) {
                    if (xSolve(c, 1)) return;
                }
            }
        }

        return {
            newGuy: xinitContestant,
            randomSolve,
            fetchProblemSubs,
            fetchProblemList,
            initFetchAll,
        };
    });

    function makeHRGetter(contestDataParams, problemDataParams) {
        return (options) => {

            let groups = null;

            async function getContestData(curl) {
                const reqData = contestDataParams(curl)
                const raw = await fetchWhileHR(
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
                const raw = await fetchWhileHR(
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
                    const key = `hrcontest_${url}`;
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
                return groups = problemGroups;
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

            async function initFetchAll(proc) {
                let promises = [];
                for (const group of groups) {
                    for (const prob of group.probs) {
                        promises.push(initFetchProblem(prob, proc));
                    }
                }
                await Promise.all(promises);
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
            const rawRows = await fetchWhileCF(
                `${codeforces}/api/contest.standings`,
                { contestId: contestId },
                400, // limit
                (x) => {
                    rawProblems = x.result.problems;
                    return x.result.rows;
                }
            );

            const cleanedProblems = [];
            for (const rawProb of rawProblems) {
                cleanedProblems.push({
                    maxScore: rawProb.points,
                    slug: `${contestId}_${rawProb.index}`,
                    name: rawProb.name,
                    id: `CF..${contestId}..${rawProb.index}`,
                });
            }

            const problemSubs = {};
            for (const prob of cleanedProblems) {
                problemSubs[prob.id] = {
                    prob,
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
                        problemSubs[prob.id].subs.push({
                            contestantName: name,
                            score: score,
                            penalty: penalty,
                        })
                    }
                }
            }

            return {problems: cleanedProblems, problemSubs};
        }

        let everythings = {};
        async function fetchProblemList() {
            let problemGroups = [];
            for (let i = 0; i < options.curls.length; i++) {
                const url = options.curls[i];
                const contestId = options.cfContestIDs[i];
                let key = `cfcontest_${contestId}_${url}`;
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
                    if (everything) {
                        everything.url = url;
                        localStorage.setItem(key, JSON.stringify(everything));
                    }
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
                const url = everythings[contestId].url;
                const key = `cfcontest_${contestId}_${url}`;

                console.log("Fetching everything contest ID", contestId);
                const everything = await getContestData(contestId).catch((x) => {
                    console.log(contestId, "Got error", x);
                    console.log(contestId, `Failed to fetch everything for ${contestId}.`,
                            ` Please try again later.`);
                });

                if (everythings[contestId] = everything) {
                    // save to localStorage
                    localStorage.setItem(key, JSON.stringify(everything));
                    for (const probId in everything.problemSubs) {
                        const probSubs = everything.problemSubs[probId];
                        proc(probSubs.prob, probSubs.subs);
                    }
                }
            };
        }

        async function initFetchAll(proc) {
            for (const contestId in everythings) {
                const everything = everythings[contestId];
                if (everything) {
                    for (const probId in everything.problemSubs) {
                        const probSubs = everything.problemSubs[probId];
                        proc(probSubs.prob, probSubs.subs);
                    }
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
    function isclose(a, b, eps = 1e-5) {
        return Math.abs(a - b) / Math.max(1, Math.max(Math.abs(a), Math.abs(b))) <= eps;
    }

    Vue.filter('hmPenalty', function(penalty, fixed) {
        const h = Math.floor(penalty / 60);
        const m = (penalty - 60 * h).toFixed(fixed);
        const p = m < 10 ? "0" : "";
        return `${h}:${p}${m}`;
    })

    Vue.filter('score', function(score, maxD) {
        if (score == -1) return ".";
        score /= 1;
        let fixed = 0;
        while (fixed < maxD && !isclose(score, +score.toFixed(fixed))) fixed++;
        return score == -1 ? "." : score.toFixed(fixed);
    })

    Vue.filter('styleForTotalScore', function(score, maxScore) {
        score /= maxScore;

        let red = Math.round(0xF0 * (1 - score) + 0x5E * score);
        let green = Math.round(0xF0 * (1 - score) + 0xFF * score);
        let blue = Math.round(0xF0 * (1 - score) + 0x83 * score);
        let bgcolor = `rgba(${red}, ${green}, ${blue}, 0.8)`;
        return {'background-color': bgcolor};
    });

    Vue.filter('styleForScore', function(score, maxScore, showBlank) {
        let color = score == -1 ? `rgba(117, 117, 117)` : "";
        let bgcolor = `rgba(${0xff}, ${0xff}, ${0xff}, 0.333)`
        if (!showBlank || score != -1) {
            // gray#DDDDDD to green#5EEE83
            score = Math.max(score, 0) / maxScore;
            let red = Math.round(0xDD * (1 - score) + 0x5E * score);
            let green = Math.round(0xDD * (1 - score) + 0xEE * score);
            let blue = Math.round(0xDD * (1 - score) + 0x83 * score);
            bgcolor = `rgba(${red}, ${green}, ${blue}, 0.5)`;
        }
        return {'background-color': bgcolor, 'color': color};
    });

    Vue.filter('styleForPenalty', function (penalty, maxPenalty) {
        penalty /= maxPenalty;
        let g = Math.round(255 * (1 - 0.2 * penalty));
        let bgcolor = `rgba(${g}, ${g}, ${g}, 0.5)`
        return {'background-color': bgcolor};
    });

    Vue.filter('styleForRank', function (rank, rankRules) {
        let color = (() => {
            for (const rankRule of rankRules) {
                if (rank <= rankRule.rank) return rankRule.color;
            }
            return "#EEEEEE";
        })();
        return {'background-color': color};
    });

    let rankRuleses = {
        "noielims": [
            {rank: 30, color: "#00CC00"},
        ],
        "noielims2016": [
            {rank: 20, color: "#00CC00"},
        ],
        "noifinals2019": [
            {rank: 1, color: "#FFD700"},
            {rank: 3, color: "#C0C0C0"},
            {rank: 6, color: "#CD7F32"},
            {rank: 10, color: "#00BB00"},
        ],
        "noifinals": [
            {rank: 1, color: "#FFD700"},
            {rank: 3, color: "#C0C0C0"},
            {rank: 6, color: "#CD7F32"},
            {rank: 15, color: "#00BB00"},
        ],
        "noiteam": [
            {rank: 4, color: "#00CC00"},
        ],
        "generic": [],
    }


    async function getContestDetails(options) {
        const search = new URLSearchParams(window.location.search);

        let ruleType       = search.get("type") || options.demo ? "noifinals2019": "generic";
        let pastCurls      = search.get("past") ? search.get("past").split(",") : [];
        let fetchCurls     = search.get("fetch") ? search.get("fetch").split(",") : [];
        let cfContestIDs   = search.get("ids") ? search.get("ids").split(",") : [];
        const penaltyFixed = search.get("pd") ? parseInt(search.get("pd")) : 0;
        const tScoreMax    = search.get("td") ? parseInt(search.get("td")) : 2;
        const scoreMax     = search.get("sd") ? parseInt(search.get("sd")) : 2;
        const nohilit      = search.get("nohilit") ? parseInt(search.get("nohilit")) : 0;
        const showBlank    = search.get("blanks") ? parseInt(search.get("blanks")) : 0;
        const contest      = search.get("contest") || null;
        const contestYear  = search.get("year") ? parseInt(search.get("year")) : currentYear;
        let source         = search.get("source") ? search.get("source") : contestYear >= 2020 ? "CF" : "HR";

        let rankRules = rankRuleses[ruleType];

        if (options.demo) {
            pastCurls = [];
            fetchCurls = ["Day 1", "Day 2"];
            source = "DEMO";
        } else {


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
        }

        console.log("got details", fetchCurls, pastCurls, rankRules);
        if (!rankRules) {
            alert(`Unknown 'type' ${ruleType}.`);
            rankRules = [];
        }

        let fetchInterval = source == "CF" ? 24111 : source == "HR" ? 6111 : 6111;

        if (source == "CF" && cfContestIDs.length == 0) { // attempt to lookup a hardcoded list.
            let cfcontests = (await axios.get(`contests/cfcontests.json`,
                        { timeout: 60000 })
                .catch((x) => {
                    console.log("cfcontests.json cannot be read:", x);
                })
            );
            if (cfcontests) cfcontests = cfcontests.data;
            if (cfcontests) cfcontests = cfcontests["" + contestYear];
            if (cfcontests) cfcontests = cfcontests[contest];
            if (cfcontests) cfContestIDs = cfcontests;
        }

        let curls = pastCurls.concat(fetchCurls);

        if (source == "CF") {
            if (cfContestIDs.length == 0) {
                alert(`Contest IDs missing. Please pass them as URL params`);
                curls = [];
            }

            if (curls.length != cfContestIDs.length) {
                alert(`The number of contest urls must equal the number CF contest IDs.`)
                curls = [];
            }
        }

        console.log("got details", curls, cfContestIDs);

        const parallelContestURLs = {
            "noi-ph-2018-team": ["noi-ph-2018-team-early"],
            "noi-ph-2017-team": ["noi-ph-2017-team-early"],
        };

        let getter;
        if (options.demo) {
            getter = DemoGetter({curls});
        } else if (source == "CF") {
            getter = CFGetter({curls, cfContestIDs});
        } else if (source == "HR") {
            // getter = HRGetter({parallelContestURLs, curls});
            getter = HRKunoGetter({parallelContestURLs, curls});
            // getter = HRAzureGetter({parallelContestURLs, curls});
        } else {
            alert(`Unknown source: ${source}`);
            getter = HRKunoGetter({parallelContestURLs, curls});
        }

        return {
            getter,
            rankRules,
            penaltyFixed,
            tScoreMax,
            scoreMax,
            nohilit,
            showBlank,
            fetchCurls,
            fetchInterval,
            demo: options.demo,
        };
    }

    async function initScoreboard(options) {
        if (!options) options = {};
        const contestDetails = await getContestDetails(options);

        const getter = contestDetails.getter;
        const vm = new Vue({
            el: '#scoreboard',
            data: {
                problemGroups: [],
                contestants: [],
                loadedProblem: {},

                showPenalty: true,
                startedFetchLoop: false,
                fetchInterval: contestDetails.fetchInterval,

                fetchCurls: contestDetails.fetchCurls,
                rankRules: contestDetails.rankRules,
                penaltyFixed: contestDetails.penaltyFixed,
                tScoreMax: contestDetails.tScoreMax,
                scoreMax: contestDetails.scoreMax,
                nohilit: contestDetails.nohilit,
                showBlank: contestDetails.showBlank,

                demo: contestDetails.demo,
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
                setScore(problem, sub) {
                    let contestant = this.getOrCreateContestant(sub.contestantName);
                    let csub = contestant.subs[problem.id];
                    csub.score = sub.score;
                    csub.penalty = sub.penalty;
                },

                getOrCreateContestant(name) {
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

                    if (this.demo) {
                        console.log("No fetch loop for demo");
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
                                    this.fix();
                                }
                            }
                        }
                        if (!found) break;
                    }

                    console.log("Did not find anything to fetch. Stopping fetch loop.");
                    this.startedFetchLoop = false;
                },

                // fetches
                async fetchProblem(problem) {
                    if (!problem) console.warn("WARNING: PROBLEM NOT FOUND!");
                    await getter.fetchProblemSubs(problem, (prob, subs) => {
                        this.processSubs(prob, subs);
                    });
                },

                async initFetchAll() {
                    this.problemGroups = await getter.fetchProblemList();
                    await getter.initFetchAll((prob, subs) => {
                        this.processSubs(prob, subs);
                        this.loadedProblem[prob.id] = true;
                        this.fix();
                    });
                    this.fix();
                },

                processSubs(problem, subs) {
                    if (subs) for (const sub of subs) {
                        this.setScore(problem, sub);
                    }
                },

                // recompute the aggregate and rank data
                fix() {
                    console.log("FIXING");
                    this.contestants = this.contestants.slice(); // so that vue.js notices... feels hacky though.

                    (() => {// recompute aggregates
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
                    })();

                    (() => { // recompute ranks
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
                    })();
                },

                // demo methods only
                async newGuy() {
                    getter.newGuy();
                    await this.demoLoad();
                },
                async randomSolve() {
                    getter.randomSolve();
                    await this.demoLoad();
                },
                async demoLoad() {
                    for (const group of this.problemGroups) {
                        for (const prob of group.probs) {
                            await this.fetchProblem(prob);
                        }
                    }
                    this.fix();
                },
            },
            template: `
            <div :class="[
                    problemList.length <= 10 ? 'container' : 'container-fluid',
                    nohilit ? 'nohilit' : 'hilit']">
                <div v-if="demo">
                    <button class="perturb-button btn btn-primary" v-on:click="randomSolve">+ Random submit!</button>
                    <button class="perturb-button btn" v-on:click="newGuy">+ Random new guy!</button>
                </div>
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
                                        :style="c.rank | styleForRank(rankRules)">
                                    {{ c.rank }}
                                </td>
                            </transition>
                            <td class="t-name"><div class="d-name">{{ c.name }}</div></td>
                            <transition name="entry-value" mode="out-in">
                                <td class="t-score"
                                        :key="c.score"
                                        :style="c.score | styleForTotalScore(maxScore)">
                                    {{ c.score | score(tScoreMax) }}
                                </td>
                            </transition>
                            <transition name="entry-value" mode="out-in">
                                <td class="t-penalty" :key="c.penalty" v-if="showPenalty"
                                        :style="c.penalty | styleForPenalty(maxPenalty)">
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
                                        :style="c.subs[prob.id].score | styleForScore(prob.maxScore, showBlank)">
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
