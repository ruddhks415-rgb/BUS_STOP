const apiKey = 'CLwuKEs3nbQV0t5lkmCq%2B8vK7ya%2BALCbarBq3%2BD8X6wtvaauV2uh3swCfSaE3N0nVaQPXWpI3Zsc8UyGUDp75Q%3D%3D';
const url = `http://apis.data.go.kr/6290000/busarrivalinfo/getBusArrivalInfo?serviceKey=${apiKey}&stationId=4248`;
fetch(url).then(r=>r.text()).then(console.log);
