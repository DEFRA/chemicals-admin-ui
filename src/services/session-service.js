const set = (key, data, request) => request.yar.set(key, data);

const get = (key, request) => request.yar.get(key);

const remove = (key, request) => request.yar.clear(key);

const getSessionId = request => request.yar.id;

const revoke = (request, resetYar = true) => {
  request.server.yar.revoke(getSessionId(request));

  if (resetYar) {
    request.yar.reset();
  }
};

module.exports = {
  set,
  get,
  remove,
  getSessionId,
  revoke,
};
