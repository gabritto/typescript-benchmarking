import minimist from "minimist";

interface Preset {
    tsc?: {
        hosts: string[];
        iterations: number;
        scenarios: string[];
    };
    tsserver?: {
        hosts: string[];
        iterations: number;
        scenarios: string[];
    };
    startup?: {
        hosts: string[];
        iterations: number;
        scenarios: string[];
    };
}

const defaultIterations = 6;

// This version is arbitrary (just what was latest on 2023-08-12).
const node20 = "node@20.5.1";
// These two versions match those found in recent VS Code versions via Electron.
const node18 = "node@18.15.0";
const node16 = "node@16.17.1";
const bun = "bun@1.0.15";
const vscode = "vscode@1.82.1";

// TODO(jakebailey): include used scenarioConfigDirs in matrix and avoid cloning
const allTscScenarios = ["Angular", "Monaco", "TFS", "material-ui", "Compiler-Unions", "xstate"];
const allTsserverScenarios = ["Compiler-UnionsTSServer", "CompilerTSServer", "xstateTSServer"];
const allStartupScenarios = ["tsc-startup", "tsserver-startup", "tsserverlibrary-startup", "typescript-startup"];

// Note: keep this up to date with TSPERF_PRESET and https://github.com/microsoft/typescript-bot-test-triggerer
const presets: Record<string, Preset | undefined> = {
    "full": {
        tsc: {
            hosts: [node20, node18, node16],
            iterations: defaultIterations,
            scenarios: allTscScenarios,
        },
        tsserver: {
            hosts: [node16],
            iterations: defaultIterations,
            scenarios: allTsserverScenarios,
        },
        startup: {
            hosts: [node16],
            iterations: defaultIterations,
            scenarios: allStartupScenarios,
        },
    },
    "regular": {
        tsc: {
            hosts: [node18],
            iterations: defaultIterations,
            scenarios: allTscScenarios,
        },
        tsserver: {
            hosts: [node18],
            iterations: defaultIterations,
            scenarios: allTsserverScenarios,
        },
        startup: {
            hosts: [node18],
            iterations: defaultIterations,
            scenarios: allStartupScenarios,
        },
    },
    "tsc-only": {
        tsc: {
            hosts: [node18],
            iterations: defaultIterations,
            scenarios: allTscScenarios,
        },
    },
    "bun": {
        tsc: {
            hosts: [bun],
            iterations: defaultIterations * 2,
            scenarios: allTscScenarios,
        },
        startup: {
            hosts: [bun],
            iterations: defaultIterations,
            scenarios: allStartupScenarios.filter(s => s !== "tsserver-startup"),
        },
    },
    "vscode": {
        tsc: {
            hosts: [vscode],
            iterations: defaultIterations,
            scenarios: allTscScenarios,
        },
        tsserver: {
            hosts: [vscode],
            iterations: defaultIterations,
            scenarios: allTsserverScenarios,
        },
        startup: {
            hosts: [vscode],
            iterations: defaultIterations,
            scenarios: allStartupScenarios,
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

function sanitizeJobName(name: string) {
    return name.replace(/[^a-zA-Z0-9_]/g, "_");
}

const matrix: Record<string, Record<string, string | number | boolean | undefined>> = {};

let processTsc = false;
let processTsserver = false;
let processStartup = false;

if (baselining) {
    // If we're baselining, it'll be much faster to run all benchmarks in one job.
    processTsc = !!preset.tsc;
    processTsserver = !!preset.tsserver;
    processStartup = !!preset.startup;

    matrix.all = {
        TSPERF_JOB_NAME: "all",
        TSPERF_TSC: processTsc,
        TSPERF_TSC_HOSTS: preset.tsc?.hosts.join(","),
        TSPERF_TSC_SCENARIOS: preset.tsc?.scenarios.join(","),
        TSPERF_TSC_ITERATIONS: preset.tsc?.iterations,
        TSPERF_TSSERVER: processTsserver,
        TSPERF_TSSERVER_HOSTS: preset.tsserver?.hosts.join(","),
        TSPERF_TSSERVER_SCENARIOS: preset.tsserver?.scenarios.join(","),
        TSPERF_TSSERVER_ITERATIONS: preset.tsserver?.iterations,
        TSPERF_STARTUP: processStartup,
        TSPERF_STARTUP_HOSTS: preset.startup?.hosts.join(","),
        TSPERF_STARTUP_SCENARIOS: preset.startup?.scenarios.join(","),
        TSPERF_STARTUP_ITERATIONS: preset.startup?.iterations,
    };
}
else {
    // If we're not baselining, it should end up faster to run on as many machines as possible.
    if (preset.tsc) {
        for (const host of preset.tsc.hosts) {
            for (const scenario of preset.tsc.scenarios) {
                processTsc = true;
                const jobName = sanitizeJobName(`tsc_${host}_${scenario}`);
                matrix[jobName] = {
                    TSPERF_JOB_NAME: jobName,
                    TSPERF_TSC: true,
                    TSPERF_TSC_HOSTS: host,
                    TSPERF_TSC_SCENARIOS: scenario,
                    TSPERF_TSC_ITERATIONS: preset.tsc.iterations,
                };
            }
        }
    }

    if (preset.tsserver) {
        for (const host of preset.tsserver.hosts) {
            for (const scenario of preset.tsserver.scenarios) {
                processTsserver = true;
                const jobName = sanitizeJobName(`tsserver_${host}_${scenario}`);
                matrix[jobName] = {
                    TSPERF_JOB_NAME: jobName,
                    TSPERF_TSSERVER: true,
                    TSPERF_TSSERVER_HOSTS: host,
                    TSPERF_TSSERVER_SCENARIOS: scenario,
                    TSPERF_TSSERVER_ITERATIONS: preset.tsserver.iterations,
                };
            }
        }
    }

    if (preset.startup) {
        for (const host of preset.startup.hosts) {
            for (const scenario of preset.startup.scenarios) {
                processStartup = true;
                const jobName = sanitizeJobName(`startup_${host}_${scenario}`);
                matrix[jobName] = {
                    TSPERF_JOB_NAME: jobName,
                    TSPERF_STARTUP: true,
                    TSPERF_STARTUP_HOSTS: host,
                    TSPERF_STARTUP_SCENARIOS: scenario,
                    TSPERF_STARTUP_ITERATIONS: preset.startup.iterations,
                };
            }
        }
    }
}

console.log(JSON.stringify(matrix, undefined, 4));
console.log(`##vso[task.setvariable variable=MATRIX;isOutput=true]${JSON.stringify(matrix)}`);

// These are outputs for the ProcessResults job, specifying which results were
// produced above and need to be processed.
console.log(`##vso[task.setvariable variable=TSPERF_PROCESS_TSC;isOutput=true]${processTsc}`);
console.log(`##vso[task.setvariable variable=TSPERF_PROCESS_TSSERVER;isOutput=true]${processTsserver}`);
console.log(`##vso[task.setvariable variable=TSPERF_PROCESS_STARTUP;isOutput=true]${processStartup}`);
