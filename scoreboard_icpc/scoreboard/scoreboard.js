// by Kevin Atienza
var $scoreboard = null;

function initScoreboard(options) {

    let demoFetchData = null;

    /////////////// fake data generator. feel free to remove in production to remove whitespace
    demoFetchData = (() => {
        const xdata = {
            problems: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
            contestants: [
                {
                    name: "Team X",
                    rank: 1, score: 2, attempts: 3, penalty: 100,
                    subs: {
                        "A": { score: 1, attempts: 1, penalty: 30, pending: false },
                        "B": { score: 1, attempts: 2, penalty: 50, pending: false },
                        "C": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "D": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "E": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "F": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "G": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "H": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "I": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "J": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "K": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "L": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "M": { score: 0, attempts: 0, penalty: 0, pending: false },
                    },
                },
                {
                    name: "Team Y",
                    rank: 2, score: 2, attempts: 4, penalty: 110,
                    subs: {
                        "A": { score: 1, attempts: 2, penalty: 30, pending: false },
                        "B": { score: 1, attempts: 2, penalty: 40, pending: false },
                        "C": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "D": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "E": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "F": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "G": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "H": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "I": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "J": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "K": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "L": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "M": { score: 0, attempts: 0, penalty: 0, pending: false },
                    },
                },
                {
                    name: "Team A",
                    rank: 3, score: 1, attempts: 3, penalty: 70,
                    subs: {
                        "A": { score: 1, attempts: 3, penalty: 30, pending: false },
                        "B": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "C": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "D": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "E": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "F": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "G": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "H": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "I": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "J": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "K": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "L": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "M": { score: 0, attempts: 0, penalty: 0, pending: false },
                    },
                },
                {
                    name: "Team B",
                    rank: 3, score: 1, attempts: 4, penalty: 70,
                    subs: {
                        "A": { score: 0, attempts: 2, penalty: 0, pending: false },
                        "B": { score: 1, attempts: 2, penalty: 50, pending: false },
                        "C": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "D": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "E": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "F": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "G": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "H": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "I": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "J": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "K": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "L": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "M": { score: 0, attempts: 0, penalty: 0, pending: false },
                    },
                },
                {
                    name: "Team C",
                    rank: 5, score: 1, attempts: 1, penalty: 71,
                    subs: {
                        "A": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "B": { score: 1, attempts: 1, penalty: 71, pending: false },
                        "C": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "D": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "E": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "F": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "G": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "H": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "I": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "J": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "K": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "L": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "M": { score: 0, attempts: 0, penalty: 0, pending: false },
                    },
                },
                {
                    name: "Team LOL",
                    rank: 6, score: 0, attempts: 11, penalty: 0,
                    subs: {
                        "A": { score: 0, attempts: 5, penalty: 0, pending: false },
                        "B": { score: 0, attempts: 6, penalty: 0, pending: false },
                        "C": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "D": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "E": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "F": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "G": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "H": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "I": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "J": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "K": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "L": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "M": { score: 0, attempts: 0, penalty: 0, pending: false },
                    },
                },
                {
                    name: "Team LAL",
                    rank: 6, score: 0, attempts: 24, penalty: 0,
                    subs: {
                        "A": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "B": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "C": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "D": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "E": { score: 0, attempts: 1, penalty: 0, pending: false },
                        "F": { score: 0, attempts: 1, penalty: 0, pending: false },
                        "G": { score: 0, attempts: 11, penalty: 0, pending: false },
                        "H": { score: 0, attempts: 11, penalty: 0, pending: false },
                        "I": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "J": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "K": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "L": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "M": { score: 0, attempts: 0, penalty: 0, pending: false },
                    },
                },
                {
                    name: "Team LEL",
                    rank: 6, score: 0, attempts: 1, penalty: 0,
                    subs: {
                        "A": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "B": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "C": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "D": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "E": { score: 0, attempts: 1, penalty: 0, pending: false },
                        "F": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "G": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "H": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "I": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "J": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "K": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "L": { score: 0, attempts: 0, penalty: 0, pending: false },
                        "M": { score: 0, attempts: 0, penalty: 0, pending: false },
                    },
                },
            ],

            title: "2019 ICPC Asia-Manila Regional Programming Contest",
            lastUpdated: "Mon Dec 11 11:11:11 PHT 2019",
        };

        const sc = 0.6; // gaano kagaling
        const xeasy = 1;
        const newGuyProb = 0.3;
        const xattprobs = {
            "A": 0.11*sc,
            "B": 0.03*sc,
            "C": 0.01*sc,
            "D": 0.003*sc,
            "E": 0.002*sc,
            "F": 0.05*sc,
            "G": 0.01*sc,
            "H": 0.06*sc,
            "I": 0.005*sc,
            "J": 0.01*sc,
            "K": 0.01*sc,
            "L": 0.11*sc,
            "M": 0.21*sc,
        };
        const xsolprobs = {
            "A": 0.92*xeasy,
            "B": 0.4*xeasy,
            "C": 0.7*xeasy,
            "D": 0.7*xeasy,
            "E": 0.6*xeasy,
            "F": 0.08*xeasy,
            "G": 0.9*xeasy,
            "H": 0.08*xeasy,
            "I": 0.1*xeasy,
            "J": 0.9*xeasy,
            "K": 0.3*xeasy,
            "L": 0.12*xeasy,
            "M": 0.008*xeasy,
        };

        const xtskill = {
            "Team X": 11.0,
            "Team Y": 5.0,
            "Team A": 3.0,
            "Team B": 0.1,
            "Team C": 1.0,
            "Team LOL": 20.0,
            "Team LAL": 0.3,
            "Team LEL": 1.0,
        };

        const xteager = {
            "Team X": 1.0,
            "Team Y": 2.0,
            "Team A": 1.0,
            "Team B": 1.0,
            "Team C": 0.5,
            "Team LOL": 1.5,
            "Team LAL": 4.0,
            "Team LEL": 3.0,
        };

        const xspecs = [
            "...",
            "1BUPC",
            "2BUPC",
            ";hack",
            "A1Q",
            "A^3",
            "ABL Tree",
            "ACE1",
            "ACE2",
            "ACE3",
            "Ainge WF",
            "Alone2gether",
            "AN2KINS",
            "APT",
            "Bcc:",
            "Big-O",
            "Blackjack",
            "Blazar",
            "Blueknights",
            "BlueKnights-1",
            "BlueKnights-2",
            "BOY",
            "BTNode",
            "CCIS2017",
            "Chicken Tinola ni Chris",
            "CITU 10X",
            "Clean Mind",
            "Code Slashers",
            "Code Slayer",
            "CPCU 4197",
            "CPCU HEYYEYAAEYAAAEYAEYAA",
            "CPCU K-GOD",
            "CS:Source",
            "Dani's Angels",
            "Doom All",
            "Dragon Exceed",
            "Dragon Traverse",
            "Eliens - Makiling",
            "Eliens - Pegaraw",
            "Exceptions",
            "Fibonachips",
            "FPT_HAN_ThreeFrogs",
            "FPT_HAN_VTeam",
            "Franz's Angels",
            "Fuchsia Moth",
            "G00dMeow",
            "Gween Tea",
            "HCMUS-Serendipity",
            "Highwind",
            "Hokage",
            "ITworks",
            "JAM",
            "Jbros",
            "Keyboard Fighters",
            "Liadri",
            "Lv. 1 Crooks",
            "Magikarp",
            "Marielle's Angels",
            "M\u00f6bius",
            "Nairud",
            "Never Give Up",
            "NSF Mangoes",
            "NTHU_Jinkela",
            "NTHUccu",
            "NTU Three-headed Monster",
            "NTUNOOBS",
            "NU CCS Wizards Circle Team 1",
            "NU CCS Wizards Circle Team 2",
            "NU Wizards Circle Team A",
            "O(bf)",
            "Olemop",
            "Omega",
            "Onisnack69",
            "Pandamiao",
            "Pandamonium",
            "Panic",
            "Penguin1",
            "Penguin2",
            "PLUS ULTRA",
            "PVP",
            "Quiwarriors 0",
            "Re:Programmers",
            "RjEaCa",
            "Smoking Wombat",
            "SRC",
            "Te3s",
            "Team UM 1",
            "Team UMTC",
            "ThaThu",
            "The Hedgehogs",
            "Theta",
            "TIP SAPIENS",
            "troubleShooters",
            "Unexpected",
            "Unstoppable",
            "Xavier",
            "Zenith",
            "CHRistian Minecraft Server",
            "KFC",
            "Kakakompyuternaminto",
            "VSCOde Girls",
            "AdNU-Ignatius",
            "AdNU-Xavier",
            "BUPC",
            "MushLashWish",
            "Angin",
            "Kalayo",
            "Panganuron",
            "Raga",
            "URAN",
            "CPCU Debuggers",
            "CPCU Mate",
            "CPCU P=NP if N=1",
            "CPCU waifu=senpai",
            "Team Nautilus",
            "Team Regalia",
            "Exceptions",
            "FPTU Cache-miss",
            "FPTU NP-Hard",
            "FPTU Orange 3",
            "Polynomial",
            "choKOdai",
            "BenIsVeryBen",
            "NTU KDB",
            "NCTU_Kirin",
            "NCTU_Oimo",
            "BBQube",
            "NU-Wizards",
            "3Sophonomore",
            "7 Halim",
            "Anonymoes Wombat",
            "randomgod3",
            "NeeWhang",
            "TJU_Open Boys",
            "mickytheta",
            "UMDCoderz",
            "Registers",
            "dasehydra",
            "BTNodes",
            "Fibonachips",
            "MangTomas",
            "HCMUS-Dopamine",
            "UC Tech",
            "Nairud",
        ];

        // shuffle names
        for (let i = 0; i < xspecs.length; i++) {
            while (true) {
                let j = Math.floor((i + 1) * Math.random());
                if (j <= i) {
                    if (j != i) {
                        const t = xspecs[i]; xspecs[i] = xspecs[j]; xspecs[j] = t;
                    }
                    break;
                }
            }
        }


        let xpen = 0, xguys = 0, xspeci = 0, xquis = 0;
        async function demoFetchData(source) {
            // increase penalty a little bit
            xpen++;
            while (Math.random() < 0.1) xpen++;

            const trySolving = function(c) {
                console.log("stuck at", c, xteager[c.name])
                let done = 0;
                for (const p of xdata.problems) {
                    if (c.subs[p].pending ||
                            Math.random() < xteager[c.name] * xattprobs[p] && c.subs[p].score == 0) {
                        done++;
                        console.log("make attempt");
                        // make attempt
                        if (!c.subs[p].pending) {
                            c.subs[p].attempts++;
                            c.attempts++;
                        }
                        if (c.subs[p].pending = Math.random() < 0.06) continue;
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

            while (Math.random() < newGuyProb && xdata.contestants.length < 1111) {
                // new guy
                console.log("new team");
                const c = {
                    name: (xspeci < xspecs.length && Math.random() < 0.1 ? xspecs[xspeci++] : 
                            Math.random() < 0.8 ? `Quiwarriors ${++xquis}` : `New team ${xguys++}`),
                    score: 0,
                    attempts: 0,
                    penalty: 0,
                    subs: {},
                };
                for (const p of xdata.problems) {
                    c.subs[p] = { score: 0, attempts: 0, penalty: 0, pending: false };
                }
                xdata.contestants.push(c);
                xtskill[c.name] = 0.01 + 50.0 * Math.random() * Math.random();
                xteager[c.name] = 0.5 + 3.5 * Math.random() * Math.random() * Math.random() * Math.random();
                while (!trySolving(c));
            }

            for (const c of xdata.contestants) trySolving(c);

            // sort
            xdata.contestants.sort(function(x, y) {
                if (x.score != y.score) return y.score - x.score;
                if (x.penalty != y.penalty) return x.penalty - y.penalty;
                return 0;
            });

            // recompute rank
            for (let i = 0, rank = 0; i < xdata.contestants.length; i++) {
                if (i == 0 || xdata.contestants[i - 1].score != xdata.contestants[i].score || 
                        xdata.contestants[i - 1].penalty != xdata.contestants[i].penalty) {
                    rank = i + 1;
                }
                xdata.contestants[i].rank = rank;
            }

            // recompute summary
            xdata.summary = {
                attempts: 0,
                score: 0,
                penalty: Number.POSITIVE_INFINITY,
                subs: {},
            };

            for (const p of xdata.problems) {
                xdata.summary.subs[p] = {
                    score: 0,
                    attempts: 0,
                    penalty: Number.POSITIVE_INFINITY,
                    loaded: true,
                };
                for (const c of xdata.contestants) {
                    xdata.summary.subs[p].attempts += c.subs[p].attempts;
                    xdata.summary.subs[p].score += c.subs[p].score;
                    if (c.subs[p].score) {
                        xdata.summary.subs[p].penalty = Math.min(xdata.summary.subs[p].penalty, c.subs[p].penalty);
                    }
                }
                xdata.summary.attempts += xdata.summary.subs[p].attempts;
                xdata.summary.score += xdata.summary.subs[p].score;
                if (xdata.summary.subs[p].score) {
                    xdata.summary.penalty = Math.min(xdata.summary.penalty, xdata.summary.subs[p].penalty);
                }
            }

            return Promise.resolve(xdata);
        }

        return demoFetchData;
    })()
    /////////////// end fake data


    async function realFetchData(source) {
        const el = $( '<div></div>' );
        el.html((await axios.get(`${source}/index.html`, { timeout: 10000 })).data);
        const res = {
            problems: null,
            contestants: [],
            title: el.find("title").text(),
            lastUpdated: extractFrom("Last updated", el.find(".tail").text()),
        };


        const getAttSolv = function(attsolv) {
            const parts = attsolv.split("/");
            if (parts.length != 2) console.log(`WARNING: INVALID ATTSOLV ${attsolv}`)
            return {
                att: parseInt(parts[0]),
                solv: parseInt(parts[1]),
            }
        };
        const getScoreAttPen = function(scoreAttPen) {
            const parts = scoreAttPen.split("/");
            if (parts.length != 2) console.log(`WARNING: INVALID SCOREATTPEN ${scoreAttPen}`)
            const att = parseInt(parts[0]);
            const score = parts[1] == "--" ? 0 : 1;
            const pen = parts[1] == "--" ? 0 : parseInt(parts[1]);
            return { score, att, pen };
        };
        const getSummaryScoreAttPen = function(sumScoreAttPen) {
            const parts = sumScoreAttPen.split("/");
            if (parts.length != 3) console.log(`WARNING: INVALID SUMMARYSCOREATTPEN ${sumScoreAttPen}`)
            const att = parseInt(parts[0]);
            const score = parseInt(parts[2]);
            const pen = parts[1] == "--" ? 0 : parseInt(parts[1]);
            return { score, att, pen };
        };

        el.find("table tr").each((index, value) => {
            const children = $(value).children();
            if (children.prop("tagName").toUpperCase() == "TH") {
                if (res.problems == null) {
                    res.problems = [];
                    children.each((idx, ch) => {
                        if (!(4 <= idx && idx < children.length - 1)) return;
                        const prob = ch.innerText.trim();
                        res.problems.push(prob);
                    });
                } else {
                    children.each((idx, ch) => {
                        if (!(4 <= idx && idx < children.length - 1)) return;
                        const prob = ch.innerText.trim();
                        if (prob != res.problems[idx - 4]) console.log("WARNING: PROBLEM MISMATCH AT", idx);
                    });
                }
            } else if (children[0].innerText.trim().length) {
                const c = {
                    rank: parseInt(children[0].innerText.trim()),
                    name: children[1].innerText.trim(),
                    score: children[2].innerText.trim(),
                    penalty: children[3].innerText.trim(),
                    subs: {},
                };
                const attsolv = getAttSolv(children[children.length - 1].innerText.trim());
                if (attsolv.solv != c.score) console.log("WARNING: SOLVE COUNT MISMATCH");
                c.attempts = attsolv.att;
                let sc = 0;
                children.each((idx, ch) => {
                    if (!(4 <= idx && idx < children.length - 1)) return;
                    const scoreAttPen = getScoreAttPen(ch.innerText.trim());
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
                const attsolv = getAttSolv(children[children.length - 1].innerText.trim());
                res.summary = {
                    attempts: attsolv.att,
                    score: attsolv.solv,
                    penalty: Number.POSITIVE_INFINITY,
                    subs: {},
                };
                children.each((idx, ch) => {
                    if (!(4 <= idx && idx < children.length - 1)) return;
                    const sumScoreAttPen = getSummaryScoreAttPen(ch.innerText.trim());
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

    if (!options) options = {};

    const rankRuleses = {
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

    const demo = !!options.demo;

    // fallback to URL params
    const location = window ? window.location : null;
    const search = new URLSearchParams(location && location.search || {});
    const scoreboardSource = options.src || search.get("src") || (
            demo ? "http://localhost:8000" :
            location ? [location.protocol, '//', location.host, location.pathname, 'html'].join('') : 
            "./html/");

    const ruleType = options.type || search.get("type") || "generic";

    const nohilit = 'nohilit' in options ? options.nohilit : search.get("nohilit") ? parseInt(search.get("nohilit")) : 0;

    let rankRules = rankRuleses[ruleType];
    if (!rankRules) {
        alert(`Unknown 'type' ${ruleType}.`);
        rankRules = [];
    }

    const fetchData = demo ? demoFetchData : realFetchData;

    function extractFrom(word, source) {
        const i = source.search(word);
        return i >= 0 ? source.substring(i + word.length) : "";
    }

    const labels = {
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

    if (options.labels) {
        for (const name in options.labels) labels[name] = options.labels[name];
    }

    const vm = new Vue({
        el: '#scoreboard',
        data: {
            problems: [],
            contestants: [],
            summary: null,
            loadedAll: false,
            scoreboardSource,
            rankRules,
            showAttempts: true,
            showPenalty: true,
            hilit: !nohilit,
            labels: labels,
            startedFetchLoop: false,
        },
        async mounted() {
            this.setLoading(true);

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


            setTimeout(() => this.setLoading(false), 1000);

            this.startFetchLoop();
        },
        created() {
            document.addEventListener("visibilitychange", this.bufferLoad);
        },
        computed: {
            nameContestant() {
                const nameContestant = {};
                for (const contestant of this.contestants) {
                    nameContestant[contestant.name] = contestant;
                }
                return nameContestant;
            },

            maxScore() {
                let maxScore = 1;
                for (const contestant of this.contestants) {
                    maxScore = Math.max(maxScore, contestant.score);
                }
                return maxScore;

            },

            maxPenalty() {
                let maxPenalty = 1;
                for (const contestant of this.contestants) {
                    maxPenalty = Math.max(maxPenalty, contestant.penalty);
                }
                return maxPenalty;
            },

            maxAttempts() {
                let maxAttempts = 1;
                for (const contestant of this.contestants) {
                    maxAttempts = Math.max(maxAttempts, contestant.attempts);
                }
                return maxAttempts;
            },
        },

        methods: {
            setLoading(loading) {
                if (loading) {
                    this.$el.classList.remove("board-created");
                    this.$el.classList.add("board-loading");
                } else {
                    this.$el.classList.remove("board-loading");
                    this.$el.classList.add("board-created");
                }
            },
            bufferLoad() {
                this.setLoading(true);
                setTimeout(() => this.setLoading(false), 1000);
            },
            async startFetchLoop() {
                console.log("Starting Fetch Loop");

                if (this.startedFetchLoop) {
                    console.log("Already started. Ignoring YOU!!!");
                    return;
                }
                this.startedFetchLoop = true;

                while (true) {
                    await new Promise(resolve => setTimeout(resolve, 7111));
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
                let allData = localStorage.getItem(this.scoreboardSource);
                if (!demo && allData) {
                    console.log(`Loading ${this.scoreboardSource} from local storage`);
                    allData = JSON.parse(allData);
                    console.log(`Loaded ${this.scoreboardSource}`);
                } else {
                    allData = await this.fetchData();
                }
                this.processData(allData);
                this.loadedAll = true;
            },

            async fetchData() {
                console.log(`Fetching ${this.scoreboardSource}`);
                const allData = await fetchData(this.scoreboardSource).catch((x) => {
                    console.log("Got error", x);
                    console.log(`Failed to fetch data from ${this.scoreboardSource}. Please try again later.`);
                });

                console.log("Fetching Done");
                if (!demo && allData) localStorage.setItem(this.scoreboardSource, JSON.stringify(allData));
                return allData;
            },

            async fetchAll(problem) {
                this.processData(await this.fetchData());
            },

            processData(allData) {
                if (allData) {
                    console.log("Processing", allData);
                    this.problems = allData.problems;
                    this.contestants = allData.contestants;
                    this.summary = allData.summary;
                    this.updateMetadata(allData);
                }
            },

            // these are mostly just filter-like things.
            classForSub(c, prob) {
                const sub = c.subs[prob];
                if (sub.pending) {
                    return "scoreboard-score-pending";
                } else if (sub.attempts == 0) {
                    return "scoreboard-score-blank";
                } else if (sub.score == 0) {
                    return "scoreboard-score-no";
                } else if (sub.score > 0) {
                    const summary = this.getSummary();
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
                const rb = Math.round(222 * (1 - (this.maxScore == this.problems.length ? 1.0 : 0.8) * score));
                return `rgba(${rb}, 222, ${rb}, 0.5)`;
            },
            colorForPenalty(penalty) {
                penalty /= this.maxPenalty;
                const g = Math.round(255 * (1 - 0.0 * penalty));
                return `rgba(${g}, ${g}, ${g}, 0.333)`;
            },
            colorForAttempts(attempts) {
                attempts /= this.maxAttempts;
                const g = Math.round(255 * (1 - 0.2 * attempts));
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
        <div class="scoreboard" :class="[hilit ? 'hilit' : 'nohilit']">
            <table class="scoreboard-table table table-borderless table-sm">
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
                <transition-group name="scoreboard" tag="tbody">
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
                                            class="fas fa-question verdict-pending"
                                            :class="{'fa-xs': showAttempts}" aria-hidden="true"></i>
                                    <i v-if="!c.subs[prob].score && !c.subs[prob].pending"
                                            class="fas fa-times verdict-wa"
                                            :class="{'fa-xs': showAttempts}" aria-hidden="true"></i>
                                    <i v-if="c.subs[prob].score"
                                            class="fas fa-check verdict-ac"
                                            :class="{'fa-xs': showAttempts}" aria-hidden="true"></i>
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
                    <tr class="table-foot scoreboard-summary" :key="summaryKey()">
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
    
    const controlsID = '#scoreboard-controls';
    let controlsVm = null;
    if ($(controlsID).length == 0) {
        console.log(`No ${controlsID} found, so no controls will be made.`)
    } else {
        controlsVm = new Vue({
            el: controlsID,
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
                <form class="scoreboard-controls">
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
        });
    }

    $scoreboard = { vm, controlsVm };
    return $scoreboard;
}

