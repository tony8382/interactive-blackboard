# 技術實作對比：jQuery vs. React 動態留言板

這份文件詳細說明了從傳統 jQuery 實作遷移至現代化 React/Next.js 架構時，在動畫邏輯與性能優化上的核心差異。

## 1. 動畫實作機制

### jQuery 版本 (命令式 - Imperative)
- **原理**：直接操作 DOM 節點的樣式屬性。
- **作法**：
  ```javascript
  // 偽代碼範例
  $card.fadeIn(400, function() {
    $card.animate({
      top: targetTop,
      left: targetLeft,
      width: '320px',
      height: '320px'
    }, 900);
  });
  ```
- **缺點**：
    - **狀態難以追蹤**：當多個動畫同時進行時（例如同時有新留言與卡片移除），容易發生 DOM 衝突。
    - **性能開銷**：每次屬性改變都會觸發瀏覽器的重排 (Reflow) 與重繪 (Repaint)。

### React/Next.js 版本 (宣告式 - Declarative)
- **原理**：透過狀態 (State) 驅動 UI，利用 CSS Transitions 配合硬體加速。
- **作法**：
  ```tsx
  // MessageSticker.tsx
  <div
    style={{
      left: moveToPosition ? style?.left : '50%',
      width: moveToPosition ? '320px' : `${initialSize}px`,
      transition: 'all 900ms ease-out',
    }}
  />
  ```
- **優點**：
    - **GPU 加速**：現代瀏覽器對 CSS `transition` 和 `transform` 有高度優化，動畫更滑順。
    - **狀態一致性**：開發者只需決定卡片「現在在哪裡」，React 負責確保 DOM 狀態正確。

---

## 2. 資源預載 (Preloading)

### jQuery 版本
- **作法**：通常是在專案啟動時手動建立 `new Image()` 物件。
- **差異**：依賴腳本執行的時機，如果圖片太大，第一張卡片出現時仍可能閃爍。

### React 18+ 版本
- **作法**：使用 **Resource Hoisting** ( `<link rel="preload">`)。
- **優點**：
    - **引擎級優化**：React 會將標籤提升至 `<head>`，瀏覽器在解析 HTML 時就會並行下載圖片，速度極快。
    - **無縫銜接**：配合 Next.js 的靜態優化，確保使用者看到第一條訊息前，資源已就緒。

---

## 3. 字體與佈局優化

### jQuery 版本
- **作法**：通常使用固定字級，或透過 JS 計算 `fontSize` 後寫死在 style。
- **問題**：視窗縮放時容易跑版。

### React 版本
- **作法**：動態 `getFontSize` 計算，配合 `initialSize` 參考 `window.innerHeight`。
- **改進**：
    - **響應式字體**：根據訊息長度 (6字、12字、超過) 自動分級。
    - **Line Clamp**：利用現代 CSS (`WebkitLineClamp`) 限制行數，確保在 320x320 的小卡片中內容不會溢出。

---

## 4. 隨機性控制 (Sticking Policy)

### jQuery 版本
- **問題**：每次操作都是獨立隨機，連續抽出同色背景的機率極高 (1/6)。

### React 版 (useBoard Hook)
- **優化**：引入了 `lastPaperIndexRef` 追蹤機制。
- **結果**：保證**連續兩張卡片絕對不重複顏色**，並利用 `useState` 鎖定每張卡片的底圖，避免渲染過程中發生「閃爍變色」的怪象。

---

## 結論

從 jQuery 轉向 React，不僅是語法上的改變，更是從「操作過程」轉向「描述狀態」的思維演進。這讓動畫變得更可預測，且能利用現代瀏覽器的優化技術提供更極致的視覺體驗。
