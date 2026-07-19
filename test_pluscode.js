const url = "https://plus.codes/api?address=5WH8%2BW3%20%EA%B4%91%EC%A3%BC%EA%B4%91%EC%97%AD%EC%8B%9C";
fetch(url)
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
