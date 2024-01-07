import minimist from "minimist";

// Keep in sync with inventory.yml and benchmark.yml.
type AllAgents = "ts-perf1" | "ts-perf2" | "ts-perf3" | "ts-perf4";
// We reserve some agents so that non-baseline jobs can make progress.
type ReserveAgent = "ts-perf4";
type BaselineAgent = Exclude<AllAgents, ReserveAgent>;
type Agent = "any" | AllAgents;

type ScenarioLocation = "internal" | "public";

const defaultIterations = 6;

const hosts = {
    // This version is arbitrary (just what was latest on 2023-08-12).
    node20: "node@20.5.1",
    node18: "node@18.15.0",
    // These two versions match those found in recent VS Code versions via Electron.
    node16: "node@16.17.1",
    bun: "bun@1.0.15",
    vscode: "vscode@1.82.1",
} as const satisfies Record<string, string>;

type HostName = typeof hosts[keyof typeof hosts];

interface BaseScenario {
    name: string;
    agent: BaselineAgent;
    location: ScenarioLocation;
}

// DO NOT change the agents; they must remain the same forever to keep benchmarks comparable.
const scenarioConfig = {
    tsc: [
        { name: "Angular", agent: "ts-perf1", location: "internal" },
        { name: "Monaco", agent: "ts-perf2", location: "internal" },
        { name: "TFS", agent: "ts-perf3", location: "internal" },
        { name: "material-ui", agent: "ts-perf1", location: "internal" },
        { name: "Compiler-Unions", agent: "ts-perf2", location: "internal" },
        { name: "xstate", agent: "ts-perf3", location: "internal" },
    ],
    tsserver: [
        { name: "Compiler-UnionsTSServer", agent: "ts-perf1", location: "internal" },
        { name: "CompilerTSServer", agent: "ts-perf2", location: "internal" },
        { name: "xstateTSServer", agent: "ts-perf3", location: "internal" },
    ],
    startup: [
        { name: "tsc-startup", agent: "ts-perf1", location: "internal" },
        { name: "tsserver-startup", agent: "ts-perf2", location: "internal" },
        { name: "tsserverlibrary-startup", agent: "ts-perf3", location: "internal" },
        { name: "typescript-startup", agent: "ts-perf1", location: "internal" },
    ],
} as const satisfies Record<string, readonly BaseScenario[]>;

type ScenarioConfig = typeof scenarioConfig;

type JobKind = keyof ScenarioConfig;
const allJobKinds = Object.keys(scenarioConfig) as readonly JobKind[];

type ScenarioName = ScenarioConfig[JobKind][number]["name"];

type Preset = {
    [K in JobKind]?: {
        hosts: readonly HostName[];
        iterations: number;
        scenarios: readonly ScenarioConfig[K][number][];
    };
};

// Note: keep this up to date with TSPERF_PRESET and https://github.com/microsoft/typescript-bot-test-triggerer
const presets: Record<string, Preset | undefined> = {
    "full": {
        tsc: {
            hosts: [hosts.node20, hosts.node18, hosts.node16],
            iterations: defaultIterations,
            scenarios: scenarioConfig.tsc,
        },
        tsserver: {
            hosts: [hosts.node16],
            iterations: defaultIterations,
            scenarios: scenarioConfig.tsserver,
        },
        startup: {
            hosts: [hosts.node16],
            iterations: defaultIterations,
            scenarios: scenarioConfig.startup,
        },
    },
    "regular": {
        tsc: {
            hosts: [hosts.node18],
            iterations: defaultIterations,
            scenarios: scenarioConfig.tsc,
        },
        tsserver: {
            hosts: [hosts.node18],
            iterations: defaultIterations,
            scenarios: scenarioConfig.tsserver,
        },
        startup: {
            hosts: [hosts.node18],
            iterations: defaultIterations,
            scenarios: scenarioConfig.startup,
        },
    },
    "tsc-only": {
        tsc: {
            hosts: [hosts.node18],
            iterations: defaultIterations,
            scenarios: scenarioConfig.tsc,
        },
    },
    "bun": {
        tsc: {
            hosts: [hosts.bun],
            iterations: defaultIterations * 2,
            scenarios: scenarioConfig.tsc,
        },
        startup: {
            hosts: [hosts.bun],
            iterations: defaultIterations,
            scenarios: scenarioConfig.startup.filter(s => s.name !== "tsserver-startup"),
        },
    },
    "vscode": {
        tsc: {
            hosts: [hosts.vscode],
            iterations: defaultIterations,
            scenarios: scenarioConfig.tsc,
        },
        tsserver: {
            hosts: [hosts.vscode],
            iterations: defaultIterations,
            scenarios: scenarioConfig.tsserver,
        },
        startup: {
            hosts: [hosts.vscode],
            iterations: defaultIterations,
            scenarios: scenarioConfig.startup,
        },
    },
};

const args = minimist(process.argv.slice(2), {
    string: ["preset"],
});

const presetArg = args.preset;
const baselining = (process.env.USE_BASELINE_MACHINE || "FALSE").toUpperCase() === "TRUE";

const preset = presets[presetArg];
if (!preset) {
    // TODO(jakebailey): if "custom", build a custom matrix from arguments
    console.error(`Unknown preset: ${presetArg}`);
    process.exit(1);
}

type JobName = string & { __sanitizedJobName: never; };

function sanitizeJobName(name: string): JobName {
    return name.replace(/[^a-zA-Z0-9_]/g, "_") as JobName;
}

function setVariable(name: string, value: string | number | boolean) {
    console.log(`${name}=${value}`);
    console.log(`##vso[task.setvariable variable=${name};isOutput=true]${value}`);
}

interface Job {
    TSPERF_JOB_KIND: JobKind;
    TSPERF_JOB_NAME: JobName;
    TSPERF_JOB_HOSTS: HostName;
    TSPERF_JOB_SCENARIOS: ScenarioName;
    TSPERF_JOB_ITERATIONS: number;
    TSPERF_JOB_LOCATION: ScenarioLocation;
}

type Matrix = {
    [key in Agent]: {
        [name: JobName]: Job;
    };
};

const matrix: Matrix = {
    "any": {},
    "ts-perf1": {},
    "ts-perf2": {},
    "ts-perf3": {},
    "ts-perf4": {},
};

const processKinds = new Set<JobKind>();
const processLocations = new Set<ScenarioLocation>();

for (const jobKind of allJobKinds) {
    const p = preset[jobKind];
    if (!p) {
        continue;
    }

    for (const host of p.hosts) {
        for (const scenario of p.scenarios) {
            const agent = baselining ? scenario.agent : "any";
            const jobName = sanitizeJobName(`${jobKind}_${host}_${scenario.name}`);
            matrix[agent][jobName] = {
                TSPERF_JOB_KIND: jobKind,
                TSPERF_JOB_NAME: jobName,
                TSPERF_JOB_HOSTS: host,
                TSPERF_JOB_SCENARIOS: scenario.name,
                TSPERF_JOB_ITERATIONS: p.iterations,
                TSPERF_JOB_LOCATION: scenario.location,
            };
            processKinds.add(jobKind);
            processLocations.add(scenario.location);
        }
    }
}

for (const [agent, value] of Object.entries(matrix)) {
    setVariable(`MATRIX_${agent.replace(/-/g, "_")}`, JSON.stringify(value));
    console.log(JSON.stringify(value, undefined, 4));
}

// These are outputs for the ProcessResults job, specifying which results were
// produced previously and need to be processed. This is a space separated list,
// iterated in the pipeline in bash.
setVariable(`TSPERF_PROCESS_KINDS`, [...processKinds].sort().join(" "));
setVariable(`TSPERF_PROCESS_LOCATIONS`, [...processLocations].sort().join(","));
