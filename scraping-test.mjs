import * as cheerio from 'cheerio';

async function testScraping() {
  try {
    console.log('Fetching Jリーグ official site...');
    const res = await fetch('https://www.jleague.jp/match/search/all/all/yokohamafm/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      console.error(`HTTP Error: ${res.status} ${res.statusText}`);
      return;
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // JSON-LDを探す
    const jsonLds = $('script[type="application/ld+json"]');
    console.log('\n=== JSON-LD Analysis ===');
    console.log('JSON-LD scripts found:', jsonLds.length);
    
    if (jsonLds.length > 0) {
      jsonLds.each((i, elem) => {
        try {
          const data = JSON.parse($(elem).text());
          console.log(`\nJSON-LD ${i}:`);
          console.log('  Type:', data['@type']);
          if (data['@type'] === 'SportsEvent' || data['@type'] === 'Event') {
            console.log('  Name:', data.name?.substring(0, 50));
            console.log('  Has homeTeam:', !!data.homeTeam);
            console.log('  Has awayTeam:', !!data.awayTeam);
            console.log('  Has location:', !!data.location);
            console.log('  Has startDate:', !!data.startDate);
          }
        } catch (e) {
          console.log(`  Failed to parse JSON-LD ${i}`);
        }
      });
    }
    
    // HTML構造を探す
    console.log('\n=== HTML Element Analysis ===');
    
    // 試合情報を含むセレクタを探す
    const selectors = {
      'divs with match': $('div[class*="match"]').length,
      'divs with fixture': $('div[class*="fixture"]').length,
      'divs with schedule': $('div[class*="schedule"]').length,
      'divs with result': $('div[class*="result"]').length,
      'divs with game': $('div[class*="game"]').length,
      'table rows': $('tr').length,
      'links to /match/': $('a[href*="/match/"]').length,
    };
    
    Object.entries(selectors).forEach(([name, count]) => {
      if (count > 0) console.log(`  ${name}: ${count}`);
    });
    
    // 最初の試合リンクを探す
    console.log('\n=== First Match Links ===');
    const matchLinks = $('a[href*="/match/"]').slice(0, 5);
    matchLinks.each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().trim();
      if (href && text) {
        console.log(`  ${i}: ${text.substring(0, 40)} -> ${href.substring(0, 60)}`);
      }
    });
    
    // ページ全体の構造を確認
    console.log('\n=== Page Structure ===');
    console.log('  Title:', $('title').text());
    console.log('  H1 count:', $('h1').length);
    console.log('  H2 count:', $('h2').length);
    console.log('  Body classes:', $('body').attr('class')?.substring(0, 100));
    
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  }
}

testScraping();
