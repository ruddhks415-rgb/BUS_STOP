const fs = require('fs');
const OpenLocationCode = require('./openlocationcode.js');

const REFERENCE_LAT = 35.176461;
const REFERENCE_LNG = 126.907085;

function updateStops() {
  const markdown = fs.readFileSync('전대_주변_버스정류장_정보.md', 'utf8');
  const lines = markdown.split('\n');

  const stops = [];
  let isSummaryTable = false;

  for (const line of lines) {
    if (line.includes('## 전체 요약 테이블')) {
      isSummaryTable = true;
      continue;
    }
    
    if (isSummaryTable && line.includes('|') && !line.includes('---') && !line.includes('ARS 번호')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 5) {
        const name = parts[1];
        const ars = parts[2];
        const plusCodeRaw = parts[3];
        const direction = parts[4];
        
        if (name && ars && plusCodeRaw) {
          try {
            const shortCode = plusCodeRaw.split(' ')[0];
            const fullCode = OpenLocationCode.recoverNearest(shortCode, REFERENCE_LAT, REFERENCE_LNG);
            const decoded = OpenLocationCode.decode(fullCode);
            
            stops.push({
              id: String(ars),
              name: name,
              lat: Number(decoded.latitudeCenter.toFixed(6)),
              lng: Number(decoded.longitudeCenter.toFixed(6)),
              direction: direction.replace(' 방면', ''),
              cumulativeReports: Math.floor(Math.random() * 10)
            });
            console.log(`Successfully decoded ${name} (${ars})`);
          } catch (e) {
            console.error('Error decoding API for:', plusCodeRaw, e);
          }
        }
      }
    }
  }

  const stopsCode = `export const STOPS = ${JSON.stringify(stops, null, 2)};`;

  let mockData = fs.readFileSync('src/lib/mockData.ts', 'utf8');
  mockData = mockData.replace(/export const STOPS = \[[\s\S]*?\];/, stopsCode);

  fs.writeFileSync('src/lib/mockData.ts', mockData, 'utf8');
  console.log(`Successfully updated ${stops.length} stops!`);
}

updateStops();
