// 軸 492・493 の見本の画像（外に取りに行かない）
const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">${body}</svg>`)}`;

/** 本物の画像 */
export const landscape = svg(
  '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f8"/><stop offset="1" stop-color="#cfeafc"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><circle cx="520" cy="90" r="36" fill="#fff4cc"/><path d="M0 250 L130 140 L230 230 L360 110 L480 220 L580 150 L640 200 L640 360 L0 360Z" fill="#9fb3cf"/><path d="M0 300 L120 250 L240 300 L380 240 L520 310 L640 270 L640 360 L0 360Z" fill="#2f6b58"/>'
);

/** landscape を 16×9 px に縮めた仮画像 */
export const landscapeTiny =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAIAAAC0SDtlAAAA0UlEQVR42mNoOPqDJMTQefIHQbTn9hMggrAZJp37gRVNPvMNiCDsj+8vAhGEzTD70k8QuvBtzonXUDaYO3fHNSACMoDcRVe+AdHsc5+BbIal134uvvhl/s5r8zefX3TiJZC75Mo3CBeEdl4DcoGCCw49hChgWHXp4/ytF6HSm88vO/F84a7rcC4QAbnIIgwLtl6cuOpAQlcPEAEZEFEgI7KtxbYkLb1/8ox1x+GqgeIMQY21+tkRcATketeWIouY5ccDteVNnuVSkQfkMiDLEYMAA9EatvHG6TMAAAAASUVORK5CYII=';
