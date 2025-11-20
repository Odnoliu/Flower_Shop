export function exportToCSV(data, filename = "export.csv") {
  if (!data) data = [];
  const arr = Array.isArray(data) ? data : [data];

  if (arr.length == 0) {
    const blob = new Blob([""], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, filename);
    return;
  }

  const keys = Object.keys(arr[0]);
  const header = keys.join(",");
  const lines = arr.map(row => keys.map(k => {
    const val = row[k] == null || row[k] == undefined ? "" : String(row[k]).replace(/"/g, '""');
    return `"${val}"`;
  }).join(","));

  const csv = [header, ...lines].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

export function exportToJSON(data, filename = "export.json") {
  const json = JSON.stringify(data || [], null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
