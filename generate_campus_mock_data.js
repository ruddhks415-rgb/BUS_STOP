const fs = require('fs');

const fileContent = fs.readFileSync('jnu_buildings_with_coords.csv', 'utf8');
const content = fileContent.charCodeAt(0) === 0xFEFF ? fileContent.slice(1) : fileContent;
const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');

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

const headers = parseCSVLine(lines[0]);
const colIndex = {};
headers.forEach((h, i) => colIndex[h.trim()] = i);

const b = [];
for (let i = 1; i < lines.length; i++) {
  const r = parseCSVLine(lines[i]);
  if (!r[colIndex['건물명']]) continue;
  
  b.push({
    id: r[colIndex['번호']].replace(/"/g, ''),
    code: r[1],
    name: r[colIndex['건물명']].replace(/"/g, ''),
    lat: parseFloat(r[colIndex['위도(lat)']]),
    lng: parseFloat(r[colIndex['경도(lng)']]),
    isEstimated: r[colIndex['좌표_추정치']]?.trim() === 'TRUE',
    cumulativeReports: Math.floor(Math.random() * 10)
  });
}

const BUILDING_ISSUE_CATEGORIES = [
  {
    id: 'HVAC',
    title: '냉난방/공조',
    subcategories: ['에어컨 고장', '히터 미작동', '환풍기 고장', '온도 조절 불가']
  },
  {
    id: 'RESTROOM',
    title: '화장실/위생',
    subcategories: ['변기 막힘/고장', '세면대 파손', '휴지/비누 없음', '악취 발생', '온수 미출수']
  },
  {
    id: 'ELEC',
    title: '전기/조명',
    subcategories: ['실내 조명 꺼짐', '복도/계단 조명 꺼짐', '콘센트 파손/전원 안 됨', '누전 차단기 내려감']
  },
  {
    id: 'FACILITY',
    title: '시설 파손/누수',
    subcategories: ['천장/벽 누수', '유리창 파손', '출입문 고장', '바닥 파손/미끄럼']
  },
  {
    id: 'ELEVATOR',
    title: '승강기',
    subcategories: ['승강기 운행 정지', '승강기 갇힘', '버튼 고장']
  },
  {
    id: 'ETC',
    title: '기타',
    subcategories: ['쓰레기 방치', '소음 발생', '기타(직접 입력)']
  }
];

const fileData = `export const BUILDINGS = ${JSON.stringify(b, null, 2)};

export const BUILDING_ISSUE_CATEGORIES = ${JSON.stringify(BUILDING_ISSUE_CATEGORIES, null, 2)};
`;

fs.writeFileSync('src/lib/campusMockData.ts', fileData);
console.log('src/lib/campusMockData.ts created!');
