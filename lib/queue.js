module.exports = createQueue;

function createQueue(queue, MAX_RUNNING) {
  var totalRunning = 0;

  var api = {
    getLength: getLength,
    shift: shift,
    doneOne: doneOne,
    push: push
  }
  return api;

  function getLength() {
    return queue.length;
  }

  function shift() {
    if (queue.length > 0 && totalRunning < MAX_RUNNING) {
      totalRunning += 1;
      return queue.shift();
    }
  }

  function push(id) {
    queue.push(id);
  }

  function doneOne() {
    totalRunning -= 1;
  }
}
