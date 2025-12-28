import * as cheerio from 'cheerio';

async function analyzeDetailedStructure() {
  try {
    console.log('Fetching Jリーグ official site...\n');
    const res = await fetch('https://www.jleague.jp/match/search/all/all/yokohamafm/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      console.error(`HTTP Error: ${res.status}`);
      return;
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // テーブル行を分析
    console.log('=== Table Structure Analysis ===');
    const rows = $('tr');
    console.log(`Total rows: ${rows.length}\n`);
    
    // 最初の5行を詳しく分析
    console.log('First 5 rows:');
    rows.slice(0, 5).each((i, row) => {
      const cells = $(row).find('td, th');
      const text = $(row).text().trim().substring(0, 100);
      console.log(`  Row ${i}: ${cells.length} cells, text: "${text}"`);
      
      // セルの内容を表示
      cells.slice(0, 3).each((j, cell) => {
        const cellText = $(cell).text().trim().substring(0, 40);
        const links = $(cell).find('a');
        if (links.length > 0) {
          const href = $(links.first()).attr('href');
          console.log(`    Cell ${j}: "${cellText}" -> href: ${href?.substring(0, 50)}`);
        } else {
          console.log(`    Cell ${j}: "${cellText}"`);
        }
      });
    });
    
    // 試合情報を含むテーブル行を探す
    console.log('\n=== Match Data Rows ===');
    let matchCount = 0;
    rows.each((i, row) => {
      const text = $(row).text();
      // スコアを含む行を探す（例：1-0, 2-1など）
      if (/\d-\d/.test(text) && text.includes('FM')) {
        matchCount++;
        if (matchCount <= 3) {
          console.log(`\nMatch ${matchCount}:`);
          console.log('  Full text:', text.substring(0, 150));
          
          // リンクを探す
          const links = $(row).find('a[href*="/match/"]');
          links.each((j, link) => {
            const href = $(link).attr('href');
            const linkText = $(link).text().trim();
            if (href && linkText) {
              console.log(`  Link ${j}: "${linkText}" -> ${href}`);
            }
          });
        }
      }
    });
    console.log(`\nTotal match rows found: ${matchCount}`);
    
    // 個別の試合詳細ページを取得してみる
    console.log('\n=== Fetching Individual Match Page ===');
    const firstMatchLink = $('a[href*="/match/"][href*="/live/"]').first().attr('href');
    if (firstMatchLink) {
      const fullUrl = `https://www.jleague.jp${firstMatchLink}`;
      console.log(`Fetching: ${fullUrl}`);
      
      const matchRes = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (matchRes.ok) {
        const matchHtml = await matchRes.text();
        const $match = cheerio.load(matchHtml);
        
        console.log('\n  Match Page Analysis:');
        console.log('  Title:', $match('title').text());
        
        // JSON-LDを探す
        const jsonLds = $match('script[type="application/ld+json"]');
        console.log('  JSON-LD scripts:', jsonLds.length);
        
        if (jsonLds.length > 0) {
          try {
            const data = JSON.parse(jsonLds.first().text());
            console.log('  JSON-LD Type:', data['@type']);
            console.log('  JSON-LD Keys:', Object.keys(data).slice(0, 15).join(', '));
            
            // SportsEvent の場合
            if (data['@type'] === 'SportsEvent' || data.name) {
              console.log('  Event Name:', data.name?.substring(0, 60));
              if (data.homeTeam) console.log('  Home Team:', data.homeTeam.name);
              if (data.awayTeam) console.log('  Away Team:', data.awayTeam.name);
              if (data.location) console.log('  Location:', data.location.name);
              if (data.startDate) console.log('  Start Date:', data.startDate);
            }
          } catch (e) {
            console.log('  Failed to parse JSON-LD');
          }
        }
        
        // スコア情報を探す
        const scoreElements = $match('[class*="score"]');
        console.log('  Score elements found:', scoreElements.length);
        
        // チーム名を探す
        const teamElements = $match('[class*="team"]');
        console.log('  Team elements found:', teamElements.length);
      }
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

analyzeDetailedStructure();
