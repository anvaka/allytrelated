module.exports = createQueue;

function createQueue(queue, MAX_RUNNING) {
  var totalRunning = 0;
  var length = queue.length;

  var api = {
    length: length,
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
      api.length = queue.length;
      return queue.shift();
    }
  }

  function push(id) {
    queue.push(id);
    api.length = queue.length;
  }

  function doneOne() {
    totalRunning -= 1;
  }
}
