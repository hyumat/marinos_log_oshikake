/**
 * Google Apps Script - Marinos Match Data API
 * Issue #145: Google Sheets をデータソースとして公開
 * 
 * デプロイ手順:
 * 1. Google Sheets を開く
 * 2. 拡張機能 > Apps Script を開く
 * 3. このコードを貼り付け
 * 4. プロジェクト設定 > スクリプトプロパティに GAS_API_TOKEN を設定
 * 5. デプロイ > 新しいデプロイ > ウェブアプリ > 誰でもアクセス可能 > デプロイ
 * 6. デプロイURLを環境変数 GAS_API_URL に設定
 */

/**
 * POST リクエストハンドラ
 * @param {Object} e - イベントオブジェクト
 * @returns {TextOutput} JSON レスポンス
 */
function doPost(e) {
  try {
    // 認証チェック
    const authHeader = e.parameter.Authorization || e.postData?.headers?.Authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!validateToken(token)) {
      return createJsonResponse({
        success: false,
        error: 'Unauthorized: Invalid or missing token'
      }, 401);
    }

    // リクエストボディを解析
    let requestData = {};
    try {
      if (e.postData && e.postData.contents) {
        requestData = JSON.parse(e.postData.contents);
      }
    } catch (parseError) {
      return createJsonResponse({
        success: false,
        error: 'Invalid JSON in request body'
      }, 400);
    }

    // アクションに応じて処理
    const action = requestData.action || 'getMatches';
    
    switch (action) {
      case 'getMatches':
        return getMatches();
      case 'getMatch':
        return getMatch(requestData.matchId);
      default:
        return createJsonResponse({
          success: false,
          error: `Unknown action: ${action}`
        }, 400);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createJsonResponse({
      success: false,
      error: error.toString()
    }, 500);
  }
}

/**
 * GET リクエストハンドラ（テスト用）
 */
function doGet(e) {
  return createJsonResponse({
    success: true,
    message: 'Marinos Match Data API is running',
    version: '1.0.0',
    endpoints: {
      'POST /': 'Get all matches or specific match',
      'actions': ['getMatches', 'getMatch']
    }
  });
}

/**
 * 全試合データを取得
 */
function getMatches() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('matches');
    
    if (!sheet) {
      return createJsonResponse({
        success: false,
        error: 'Sheet "matches" not found'
      }, 404);
    }

    // データ範囲を取得（ヘッダー行を含む）
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) {
      // ヘッダーのみ、またはデータなし
      return createJsonResponse({
        success: true,
        data: []
      });
    }

    // ヘッダー行（1行目）
    const headers = values[0];
    
    // データ行（2行目以降）
    const rows = values.slice(1);
    
    // オブジェクトの配列に変換
    const matches = rows.map(row => {
      const match = {};
      headers.forEach((header, index) => {
        const value = row[index];
        
        // 空の値は null に変換
        if (value === '' || value === undefined) {
          match[header] = null;
        } else {
          match[header] = value;
        }
      });
      return match;
    }).filter(match => {
      // match_id が空の行はスキップ
      return match.match_id && match.match_id !== '';
    });

    return createJsonResponse({
      success: true,
      data: matches,
      count: matches.length
    });
  } catch (error) {
    Logger.log('Error in getMatches: ' + error.toString());
    return createJsonResponse({
      success: false,
      error: error.toString()
    }, 500);
  }
}

/**
 * 特定の試合データを取得
 * @param {string} matchId - 試合ID
 */
function getMatch(matchId) {
  try {
    if (!matchId) {
      return createJsonResponse({
        success: false,
        error: 'matchId is required'
      }, 400);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('matches');
    
    if (!sheet) {
      return createJsonResponse({
        success: false,
        error: 'Sheet "matches" not found'
      }, 404);
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) {
      return createJsonResponse({
        success: false,
        error: 'Match not found'
      }, 404);
    }

    const headers = values[0];
    const matchIdIndex = headers.indexOf('match_id');
    
    if (matchIdIndex === -1) {
      return createJsonResponse({
        success: false,
        error: 'Column "match_id" not found in sheet'
      }, 500);
    }

    // match_id で検索
    const matchRow = values.slice(1).find(row => row[matchIdIndex] === matchId);
    
    if (!matchRow) {
      return createJsonResponse({
        success: false,
        error: 'Match not found'
      }, 404);
    }

    // オブジェクトに変換
    const match = {};
    headers.forEach((header, index) => {
      const value = matchRow[index];
      match[header] = value === '' || value === undefined ? null : value;
    });

    return createJsonResponse({
      success: true,
      data: match
    });
  } catch (error) {
    Logger.log('Error in getMatch: ' + error.toString());
    return createJsonResponse({
      success: false,
      error: error.toString()
    }, 500);
  }
}

/**
 * トークン検証
 * @param {string} token - Bearer トークン
 * @returns {boolean} 検証結果
 */
function validateToken(token) {
  if (!token) {
    return false;
  }

  // スクリプトプロパティから有効なトークンを取得
  const validToken = PropertiesService.getScriptProperties().getProperty('GAS_API_TOKEN');
  
  if (!validToken) {
    Logger.log('Warning: GAS_API_TOKEN not set in script properties');
    return false;
  }

  return token === validToken;
}

/**
 * JSON レスポンスを作成
 * @param {Object} data - レスポンスデータ
 * @param {number} statusCode - HTTPステータスコード（デフォルト: 200）
 * @returns {TextOutput} JSON レスポンス
 */
function createJsonResponse(data, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // GAS では HTTP ステータスコードを直接設定できないため、
  // レスポンスボディに含める
  if (statusCode !== 200) {
    data.statusCode = statusCode;
  }
  
  return output;
}

/**
 * テスト関数: Sheets からデータを取得して Logger に出力
 */
function testGetMatches() {
  const response = getMatches();
  const data = JSON.parse(response.getContent());
  Logger.log('Test result:');
  Logger.log(JSON.stringify(data, null, 2));
}

/**
 * テスト関数: 特定の試合を取得
 */
function testGetMatch() {
  const response = getMatch('M001'); // 適切な match_id に変更
  const data = JSON.parse(response.getContent());
  Logger.log('Test result:');
  Logger.log(JSON.stringify(data, null, 2));
}

/**
 * セットアップ関数: スクリプトプロパティにトークンを設定
 * 実行前に YOUR_SECRET_TOKEN を実際のトークンに変更してください
 */
function setupToken() {
  const token = 'YOUR_SECRET_TOKEN_HERE'; // 変更してください
  PropertiesService.getScriptProperties().setProperty('GAS_API_TOKEN', token);
  Logger.log('Token set successfully');
}
