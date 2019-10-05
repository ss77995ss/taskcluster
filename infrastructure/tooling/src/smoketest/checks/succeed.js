const taskcluster = require('taskcluster-client');

exports.tasks = [];
exports.tasks.push({
  title: 'Built-in/succeed task check',
  requires: [],
  provides: [
    'built-in/succeed',
  ],
  run: async (requirements, utils) => {
    let task = {
      provisionerId: 'built-in',
      workerType: 'succeed',
      created: (new Date()).toJSON(),
      deadline: taskcluster.fromNowJSON('2 minutes'),
      metadata: {
        name: "Smoketest built-in/succeed",
        description: "built-in/succeed task created during smoketest",
        owner: "smoketest@taskcluster.net",
        source: "https://taskcluster.net",
      },
      payload: {},
    };
    let taskId = taskcluster.slugid();
    utils.status({message: 'built-in/succeed taskId: ' + taskId});
    let queue = new taskcluster.Queue(taskcluster.fromEnvVars());
    await queue.createTask(taskId, task);
    let pollForStatusStart = new Date();
    while((new Date() - pollForStatusStart) < 120000){
      let status = await queue.status(taskId);
      if (status.status.state === 'pending' || status.status.state === 'running'){
        utils.status({
          message: 'Polling built-in/succeed task. Current status: ' + status.status.state,
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (status.status.state === 'completed') {
        return {
          ['built-in/succeed']: status.status.state,
        };
      } else {
        throw new Error('Task finished with status ' + status.status.state);
      }
    }
    throw new Error('Deadline exceeded');
  },
});