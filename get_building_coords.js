const fs = require('fs');
const https = require('https');

const KAKAO_REST_API_KEY = "e1d17401ba580f03932fa209e530f92a";
const INPUT_CSV = "jnu_buildings_full.csv";
const OUTPUT_CSV = "jnu_buildings_with_coords.csv";
const SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

function searchPlace(query) {
  return new Promise((resolve) => {
    const url = `${SEARCH_URL}?query=${encodeURIComponent(query)}`;
    const req = https.get(url, {
      headers: { "Authorization": `KakaoAK ${KAKAO_REST_API_KEY}` }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.documents && json.documents.length > 0) {
            resolve(json.documents[0]);
          } else {
            resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
  });
}

function parseCSVLine(line) {
  const result = [];
  let inQuotes = false;
  let currentStr = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i+1] === '"') {
      currentStr += '"'; i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(currentStr); currentStr = '';
    } else {
      currentStr += char;
    }
  }
  result.push(currentStr);
  return result;
}

async function main() {
  const fileContent = fs.readFileSync(INPUT_CSV, 'utf8');
  // Handle utf-8-sig (BOM)
  const content = fileContent.charCodeAt(0) === 0xFEFF ? fileContent.slice(1) : fileContent;
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  
  const headers = parseCSVLine(lines[0]);
  const colIndex = {};
  headers.forEach((h, i) => colIndex[h.trim()] = i);
  
  const results = [];
  let success = 0, fail = 0;
  
  const failedItems = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    const num = row[colIndex["번호"]];
    const name = row[colIndex["건물명"]];
    const q1 = row[colIndex["검색용_쿼리1"]];
    const q2 = row[colIndex["검색용_쿼리2"]];
    
    let place = await searchPlace(q1);
    let matchedQuery = q1;
    
    if (!place) {
      place = await searchPlace(q2);
      matchedQuery = q2;
    }
    
    if (place) {
      success++;
      results.push([
        num, name, place.place_name, place.y, place.x, place.road_address_name, place.address_name, matchedQuery, "Y"
      ]);
      console.log(`[OK] ${name} -> ${place.place_name} (${place.y}, ${place.x})`);
    } else {
      fail++;
      results.push([
        num, name, "", "", "", "", "", "", "N"
      ]);
      failedItems.push(name);
      console.log(`[FAIL] ${name} -> 검색 결과 없음`);
    }
  }
  
  const outputHeaders = ["번호", "건물명", "매칭_장소명", "위도(lat)", "경도(lng)", "도로명주소", "지번주소", "매칭쿼리", "검색성공"];
  
  const csvContent = [outputHeaders, ...results].map(row => 
    row.map(cell => {
      const cellStr = String(cell);
      return cellStr.includes(',') || cellStr.includes('"') ? `"${cellStr.replace(/"/g, '""')}"` : cellStr;
    }).join(',')
  ).join('\n');
  
  // write with BOM for Excel
  fs.writeFileSync(OUTPUT_CSV, '\ufeff' + csvContent, 'utf8');
  
  console.log("\\n===== 결과 요약 =====");
  console.log(`전체: ${lines.length - 1}건 / 성공: ${success}건 / 실패: ${fail}건`);
  
  if (failedItems.length > 0) {
    console.log("\\n--- 검색 실패 항목 ---");
    failedItems.forEach(item => console.log(item));
  }
}

main();
