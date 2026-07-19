const fs = require('fs');
const https = require('https');

const KAKAO_REST_API_KEY = "e1d17401ba580f03932fa209e530f92a";
const CSV_FILE = "jnu_buildings_with_coords.csv";
const SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

// User provided recommendations
const RETRY_DATA = {
  "법학전문대학원 프라임관": { queries: ["전남대학교 프라임관", "전남대 법학전문대학원"], fallbackGroup: "법학" },
  "제2학생마루(제2학생회관)": { queries: ["전남대학교 제2학생회관"], fallbackGroup: "제2학생회관" },
  "수의과대학 실험동물사": { queries: ["전남대학교 수의과대학"], fallbackGroup: "수의과대학" },
  "사범대학부설 중고등학교": { queries: ["전남대학교사범대학부설고등학교"], fallbackGroup: "사범대학" },
  "대학본부(홍도)": { queries: ["전남대학교 대학본부"], fallbackGroup: "대학본부" },
  "중앙도서관 별관(백도)": { queries: ["전남대학교 중앙도서관"], fallbackGroup: "중앙도서관" },
  "산학협력 3호관": { queries: ["전남대학교 산학협력관"], fallbackGroup: "산학협력" },
  "산학협력 1호관": { queries: ["전남대학교 산학협력관"], fallbackGroup: "산학협력" },
  "공과대학 자동차중량실험동": { queries: ["전남대학교 공과대학 자동차중량실험동"], fallbackGroup: "공과대학" },
  "자연과학대학 기초과학특성화과학관": { queries: ["전남대학교 자연과학대학"], fallbackGroup: "자연과학대학" },
  "제1학생마루(제1학생회관)": { queries: ["전남대학교 제1학생회관"], fallbackGroup: "제1학생회관" }
};

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
  const fileContent = fs.readFileSync(CSV_FILE, 'utf8');
  const content = fileContent.charCodeAt(0) === 0xFEFF ? fileContent.slice(1) : fileContent;
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  
  const headers = parseCSVLine(lines[0]);
  const colIndex = {};
  headers.forEach((h, i) => colIndex[h.trim()] = i);
  
  if (!headers.includes("좌표_추정치")) {
    headers.push("좌표_추정치");
    colIndex["좌표_추정치"] = headers.length - 1;
  }
  
  const dataRows = [];
  const validCoords = []; // To store successful coordinates for fallbacks

  // First pass: Read all lines and gather valid coords
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    // Extend row length to match headers
    while (row.length < headers.length) row.push("");
    
    const isSuccess = row[colIndex["검색성공"]] === "Y";
    if (isSuccess) {
      validCoords.push({
        name: row[colIndex["건물명"]],
        lat: parseFloat(row[colIndex["위도(lat)"]]),
        lng: parseFloat(row[colIndex["경도(lng)"]])
      });
      row[colIndex["좌표_추정치"]] = "FALSE";
    }
    dataRows.push(row);
  }

  // Second pass: Retry failures
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const isSuccess = row[colIndex["검색성공"]] === "Y";
    const name = row[colIndex["건물명"]];
    
    if (!isSuccess && RETRY_DATA[name]) {
      console.log(`Retrying [${name}]...`);
      let place = null;
      let matchedQuery = "";
      
      const queries = RETRY_DATA[name].queries;
      for (const query of queries) {
        place = await searchPlace(query);
        if (place) {
          matchedQuery = query;
          break;
        }
      }
      
      if (place) {
        console.log(`  -> SUCCESS with query '${matchedQuery}'`);
        row[colIndex["매칭_장소명"]] = place.place_name;
        row[colIndex["위도(lat)"]] = place.y;
        row[colIndex["경도(lng)"]] = place.x;
        row[colIndex["도로명주소"]] = place.road_address_name;
        row[colIndex["지번주소"]] = place.address_name;
        row[colIndex["매칭쿼리"]] = matchedQuery;
        row[colIndex["검색성공"]] = "Y";
        row[colIndex["좌표_추정치"]] = "FALSE";
        
        // Add to valid coords in case it's needed for fallback later
        validCoords.push({
          name: name,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x)
        });
      } else {
        console.log(`  -> STILL FAILED. Applying fallback...`);
        const fallbackGroup = RETRY_DATA[name].fallbackGroup;
        // Find a valid coord that includes the fallback group name
        const reference = validCoords.find(c => c.name.includes(fallbackGroup)) || validCoords[0]; 
        
        if (reference) {
          const offsetX = (Math.random() * 0.0004) - 0.0002;
          const offsetY = (Math.random() * 0.0004) - 0.0002;
          const newLat = reference.lat + offsetY;
          const newLng = reference.lng + offsetX;
          
          row[colIndex["매칭_장소명"]] = "(추정) " + name;
          row[colIndex["위도(lat)"]] = newLat.toFixed(7);
          row[colIndex["경도(lng)"]] = newLng.toFixed(7);
          row[colIndex["매칭쿼리"]] = "Fallback offset from: " + reference.name;
          row[colIndex["검색성공"]] = "Y"; // Mark as Y so it gets rendered
          row[colIndex["좌표_추정치"]] = "TRUE";
          
          console.log(`     -> Set fallback coords from ${reference.name} (Offset applied)`);
        }
      }
    } else if (!isSuccess) {
      console.log(`No retry data for [${name}]`);
    }
  }

  const csvContent = [headers, ...dataRows].map(row => 
    row.map(cell => {
      const cellStr = String(cell || "");
      return cellStr.includes(',') || cellStr.includes('"') ? `"${cellStr.replace(/"/g, '""')}"` : cellStr;
    }).join(',')
  ).join('\n');
  
  fs.writeFileSync(CSV_FILE, '\ufeff' + csvContent, 'utf8');
  console.log(`\nSuccessfully saved to ${CSV_FILE}`);
}

main();
