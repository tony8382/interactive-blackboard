try {
    const Filter = require('bad-words');
    const filter = new Filter();
    console.log(filter.clean("Don't be an ash0le"));
    console.log("Success");
} catch (e) {
    console.error(e);
}
