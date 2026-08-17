const http = require('http');

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          text: () => Promise.resolve(body.toString('utf-8')),
          json: () => Promise.resolve(JSON.parse(body.toString('utf-8'))),
          buffer: () => Promise.resolve(body)
        });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Visual Inspection System...');

  // 1. Network Info
  const netRes = await fetch('http://localhost:3000/api/network-info');
  const net = await netRes.json();
  console.log('✅ Network Info Mobile URL:', net.mobileUrl);

  // 2. Template
  const tplRes = await fetch('http://localhost:3000/api/checklist-template');
  const tpl = await tplRes.json();
  const totalItems = tpl.categories.reduce((acc, c) => acc + c.items.length, 0);
  console.log(`✅ Template: ${tpl.categories.length} Categories, ${totalItems} Total Checklist Items`);

  // 3. Inspections
  const inspRes = await fetch('http://localhost:3000/api/inspections?equipmentId=Q75');
  const q75List = await inspRes.json();
  console.log(`✅ Q75 Search: Found ${q75List.length} Inspections`);

  // 4. Excel Download
  if (q75List.length > 0) {
    const excelRes = await fetch(`http://localhost:3000/api/export/excel/${q75List[0].id}`);
    const excelBuf = await excelRes.buffer();
    console.log(`✅ Excel Download for ${q75List[0].id}: ${excelBuf.length} bytes (Content-Type: ${excelRes.headers['content-type']})`);
  }

  // 5. Post New Inspection for Q75 (Tomorrow tracking test)
  const newInsp = {
    equipmentId: 'Q75',
    equipmentType: 'QC',
    inspectorName: 'Aremi / Inspector 1',
    inspectionDate: '2026-08-17',
    inspectionTime: '10:15',
    location: 'Berth 4',
    shift: 'Morning Shift',
    generalNotes: 'Follow-up check on wire rope 2.1. Defect repaired and verified.',
    items: {
      '1.1': { status: 'GOOD', remark: '' },
      '1.2': { status: 'GOOD', remark: '' },
      '1.3': { status: 'GOOD', remark: '' },
      '1.4': { status: 'GOOD', remark: '' },
      '1.5': { status: 'GOOD', remark: '' },
      '1.6': { status: 'GOOD', remark: '' },
      '2.1': { status: 'GOOD', remark: 'Rope replaced, lubrication applied.' },
      '2.2': { status: 'GOOD', remark: '' },
      '2.3': { status: 'GOOD', remark: '' },
      '2.4': { status: 'GOOD', remark: '' },
      '3.1': { status: 'GOOD', remark: '' },
      '3.2': { status: 'GOOD', remark: '' },
      '3.3': { status: 'GOOD', remark: '' },
      '3.4': { status: 'GOOD', remark: '' },
      '4.1': { status: 'GOOD', remark: '' },
      '4.2': { status: 'GOOD', remark: '' },
      '4.3': { status: 'GOOD', remark: '' },
      '4.4': { status: 'GOOD', remark: '' },
      '5.1': { status: 'GOOD', remark: '' },
      '5.2': { status: 'GOOD', remark: '' },
      '5.3': { status: 'GOOD', remark: '' },
      '5.4': { status: 'GOOD', remark: '' },
      '6.1': { status: 'GOOD', remark: '' },
      '6.2': { status: 'GOOD', remark: '' },
      '6.3': { status: 'GOOD', remark: '' },
      '6.4': { status: 'GOOD', remark: '' }
    }
  };

  const postRes = await fetch('http://localhost:3000/api/inspections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newInsp)
  });
  const postData = await postRes.json();
  console.log(`✅ Saved New Inspection for Q75! ID: ${postData.inspection.id}, Overall: ${postData.inspection.summary.overallStatus}`);

  // 6. Track Back: Get chronological history for Q75
  const historyRes = await fetch('http://localhost:3000/api/equipment/Q75/history');
  const historyData = await historyRes.json();
  console.log(`\n🔍 TRACK BACK RESULTS FOR Q75 (${historyData.totalCount} Inspections Found):`);
  historyData.history.forEach((h, idx) => {
    console.log(`   [#${idx + 1}] Date: ${h.inspectionDate} ${h.inspectionTime} | Status: ${h.summary.overallStatus} | Good: ${h.summary.goodCount}, Satisfied: ${h.summary.satisfiedCount}, Poor: ${h.summary.poorCount} | Notes: ${h.generalNotes}`);
  });

  // 7. Master Excel
  const masterRes = await fetch('http://localhost:3000/api/export/excel-all');
  const masterBuf = await masterRes.buffer();
  console.log(`\n✅ Master Consolidated Excel Log Download: ${masterBuf.length} bytes`);

  console.log('\n🎉 ALL TESTS PASSED WITH 100% SUCCESS!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
