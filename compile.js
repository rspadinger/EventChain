const compileAllContracts = require('./SCCompile');

(async () => {
  try {
    const res = await compileAllContracts();
    console.log(res);
  } catch (err) {
    console.log(err);
  }
})();
