export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const { message } = await request.json();

    // 1. Google Sheets API を叩くためのアクセストークン生成（簡易実装版）
    // ※本格的な運用時はサービスアカウント認証を行いますが、まずは動かすために
    // Cloudflareの環境変数から情報を取得する設計にします。
    const spreadsheetId = env.SPREADSHEET_ID;
    
    // 2. Gemini API を呼び出す
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const systemPrompt = "あなたはお助けAIのhuyu(ふゆ)です。おっとりした性格で、返答は短く1〜2文にしてください。";
    
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nユーザーの発言: ${message}` }] }
        ]
      })
    });

    const geminiData = await geminiResponse.json();
    const replyText = geminiData.candidates[0].content.parts[0].text.strip();

    // 3. スプレッドシートへ会話を記録（ログ追加）
    // ※今回は解説用にGAS（Google Apps Script）のWebアプリURLを経由させる最も簡単な方法を採用します
    if (env.GAS_DEPLOY_URL) {
      await fetch(env.GAS_DEPLOY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
          user: message,
          ai: replyText
        })
      });
    }

    return new Response(JSON.stringify({ reply: replyText }), {
      headers: { "Content-Type": "application/json;charset=UTF-8" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
