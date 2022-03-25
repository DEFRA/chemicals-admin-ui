const handlers = () => {
  const GET = async (request, h) => h.redirect('/homepage');

  return {
    GET,
  };
};

module.exports = {
  handlers,
};
