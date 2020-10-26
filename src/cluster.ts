import cluster from 'cluster';

const PATH_TO_SERVER_APP = __dirname + '/server.ts';
const NUM_WORKERS = 4;
const workers: { [key: string]: cluster.Worker } = {};

cluster.setupMaster({
  execArgv: ['-r', 'tsconfig-paths/register', '-r', 'ts-node/register/transpile-only'],
  exec: PATH_TO_SERVER_APP,
} as cluster.ClusterSettings);

console.info(`Cluster: ${process.pid} Master cluster setting up ${NUM_WORKERS} workers...`);

for (let i = 0; i < NUM_WORKERS; i++) {
  const worker = cluster.fork();
  workers[worker.process.pid] = worker;
}

cluster.on('online', function (worker) {
  console.log(`Cluster: Worker ${worker.process.pid} is online`);
});

cluster.on('exit', function (worker, code, signal) {
  console.log(`Cluster: Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
  console.log('Cluster: Starting a new worker');
  const newWorker = cluster.fork();

  workers[newWorker.process.pid] = newWorker;
});

const closeCluster = () => {
  console.log(`${process.pid} Master stopped`);

  for (const pid in workers) {
    workers[pid].destroy('SIGTERM');
    console.log(`${pid} destroyed`);
  }

  process.exit(0);
};
process.on('SIGTERM', closeCluster);
process.on('SIGINT', closeCluster);
