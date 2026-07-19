const url = `http://apis.data.go.kr/6290000/busarrivalinfo/getBusArrivalInfo?serviceKey=CLwuKEs3nbQV0t5lkmCq%2B8vK7ya%2BALCbarBq3%2BD8X6wtvaauV2uh3swCfSaE3N0nVaQPXWpI3Zsc8UyGUDp75Q%3D%3D&BUSSTOP_ID=4346`;
fetch(url)
  .then(res => res.text())
  .then(data => console.log(data))
  .catch(err => console.error(err));
