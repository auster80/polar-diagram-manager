if (typeof Plotly === 'undefined') {
  const err = document.getElementById('errorMessage');
  err.innerText = 'Error: Plotly failed to load. Ensure this is run in a WebView that supports JS.';
  err.style.display = 'block';
}

let polarData = [
  {angle:0, 4:0, 6:0, 8:0, 10:0,12:0,14:0,16:0,18:0,20:0,25:0,30:0},
  {angle:45,4:1.67,6:2.54,8:3.39,10:4.19,12:4.90,14:6.65,16:8.40,18:7.68,20:6.96,25:7.06,30:6.72},
  {angle:50,4:1.99,6:2.98,8:3.91,10:4.76,12:5.53,14:6.56,16:7.59,18:7.65,20:7.72,25:7.97,30:7.97},
  {angle:55,4:2.23,6:3.30,8:4.30,10:5.18,12:6.00,14:6.75,16:7.50,18:7.93,20:8.36,25:8.71,30:8.92},
  {angle:60,4:2.41,6:3.55,8:4.59,10:5.51,12:6.37,14:7.14,16:7.91,18:8.41,20:8.90,25:9.35,30:9.66},
  {angle:80,4:3.34,6:4.79,8:6.05,10:7.21,12:8.22,14:9.02,16:9.81,18:10.2,20:10.6,25:11.62,30:12.36},
  {angle:90,4:3.38,6:4.83,8:6.10,10:7.26,12:8.27,14:9.30,16:10.32,18:10.88,20:11.45,25:12.66,30:13.59},
  {angle:100,4:3.29,6:4.71,8:5.95,10:7.10,12:8.11,14:9.10,16:10.09,18:11.14,20:12.20,25:13.43,30:14.75},
  {angle:110,4:3.09,6:4.48,8:5.71,10:6.85,12:7.89,14:8.75,16:9.61,18:10.72,20:11.83,25:14.23,30:14.25},
  {angle:120,4:2.92,6:4.26,8:5.45,10:6.56,12:7.59,14:8.28,16:8.96,18:9.90,20:10.84,25:13.76,30:13.09},
  {angle:130,4:2.69,6:3.94,8:5.08,10:6.14,12:7.14,14:7.71,16:8.28,18:9.11,20:9.94,25:12.39,30:12.13},
  {angle:140,4:2.49,6:3.59,8:4.64,10:5.59,12:6.44,14:7.01,16:7.57,18:8.16,20:8.74,25:11.25,30:11.33},
  {angle:150,4:2.34,6:3.28,8:4.24,10:5.15,12:5.99,14:6.42,16:6.83,18:7.42,20:7.88,25:10.32,30:10.68},
  {angle:170,4:2.14,6:2.97,8:3.82,10:4.63,12:5.40,14:5.72,16:7.21,18:8.20,20:9.15,25:9.21,30:10.14}
];

function getTWS() {
  return Object.keys(polarData[0]).filter(k => k!=='angle').map(Number).sort((a,b)=>a-b);
}

function renderTable() {
  const tws = getTWS(), tbl = document.getElementById('dataTable');
  let html = '<tr><th>Angle (°)</th>' +
              tws.map(w=>`<th>${w} kt</th>`).join('') +
              '<th></th></tr>';
  polarData.forEach((row,i)=>{
    html += '<tr>';
    html += `<td><input type="number" value="${row.angle}" data-idx="${i}" data-key="angle" class="cell"></td>`;
    tws.forEach(w=>{
      const v = row[w]!=null ? row[w] : '';
      html += `<td><input type="number" step="0.1" value="${v}" data-idx="${i}" data-key="${w}" class="cell"></td>`;
    });
    html += `<td><button data-idx="${i}" class="addRow">+</button></td>`;
    html += '</tr>';
  });
  tbl.innerHTML = html;
  document.querySelectorAll('.cell').forEach(el=>{
    el.oninput = ()=>{
      updateCell(el);
      plotPolar();
      plotVMG();
      const idx = +el.dataset.idx, key = el.dataset.key;
      if(key!=='angle'){ highlightPoint(polarData[idx].angle, +key); }
    };
    el.onmouseover = ()=>{
      const idx=+el.dataset.idx, key=el.dataset.key;
      if(key!=='angle'){ highlightPoint(polarData[idx].angle, +key); }
    };
    el.onmouseout = clearHighlight;
    el.onfocus = ()=>{
      const idx=+el.dataset.idx, key=el.dataset.key;
      if(key!=='angle'){ highlightPoint(polarData[idx].angle, +key); }
    };
    el.onblur = clearHighlight;
  });
  document.querySelectorAll('.addRow').forEach(btn=>{
    btn.onclick = ()=>insertRowAfter(+btn.dataset.idx);
  });
}

function insertRowAfter(idx){
  const tws = getTWS();
  const row = {angle:null};
  tws.forEach(w=>{ row[w]=null; });
  polarData.splice(idx+1,0,row);
  renderTable();
  plotPolar();
}

function updateCell(el) {
  const i=+el.dataset.idx, key=el.dataset.key==='angle'?'angle':+el.dataset.key;
  polarData[i][key] = el.value!=='' ? +el.value : null;
}

let highlighted=false;
function highlightPoint(angle,tws) {
  if(!window.Plotly) return;
  const polar = document.getElementById('polarChart');
  if(polar.data){
    polar.data.forEach((trace,i)=>{
      const sizes = trace.theta.map(a=>(a===angle && +trace.name===tws?14:6));
      Plotly.restyle(polar, {'marker.size':[sizes]}, [i]);
    });
  }
  const vmg = document.getElementById('vmgChart');
  if(vmg.data){
    vmg.data.forEach((trace,i)=>{
      const sizes = trace.x.map(a=>(a===angle && +trace.name===tws?14:6));
      Plotly.restyle(vmg, {'marker.size':[sizes]}, [i]);
    });
  }
  highlighted = true;
}
function clearHighlight() {
  if(!highlighted||!window.Plotly) return;
  const polar = document.getElementById('polarChart');
  if(polar.data){
    polar.data.forEach((_,i)=>{
      Plotly.restyle(polar, {'marker.size':[Array(polar.data[i].theta.length).fill(6)]}, [i]);
    });
  }
  const vmg = document.getElementById('vmgChart');
  if(vmg.data){
    vmg.data.forEach((_,i)=>{
      Plotly.restyle(vmg, {'marker.size':[Array(vmg.data[i].x.length).fill(6)]}, [i]);
    });
  }
  highlighted=false;
}

function plotPolar() {
  if(!window.Plotly) return;
  const tws=getTWS(); let vmax=0;
  const traces = tws.map(w=>{
    const theta=[], r=[];
    polarData.forEach(rw=>{ if(rw[w]!=null){ theta.push(rw.angle); r.push(rw[w]); vmax=Math.max(vmax,rw[w]); } });
    return {type:'scatterpolar',theta,r,mode:'lines+markers',name:`${w}`,marker:{size:6}};
  });
  // Display a semicircle rotated 90° counter-clockwise from the previous view so
  // 0° is at the top, 90° to the right and 180° at the bottom
  Plotly.newPlot('polarChart', traces, {
    polar:{
      angularaxis:{ rotation:90, direction:'clockwise', range:[0,180] },
      radialaxis:{ range:[0,vmax*1.1] },
      sector:[-90,90]
    },
    showlegend:true
  });
}

function plotVMG() {
  if(!window.Plotly) return;
  const tws=getTWS();
  const traces = tws.map(w=>{
    const x=[], y=[]; polarData.forEach(rw=>{ if(rw[w]!=null){ x.push(rw.angle); y.push(rw[w]*Math.cos(rw.angle*Math.PI/180)); } });
    return {x,y,mode:'lines+markers',name:`${w}`,type:'scatter'};
  });
  Plotly.newPlot('vmgChart', traces, { xaxis:{title:'TWA (°)'}, yaxis:{title:'VMG (kn)'} });
}

function interpolateEmpty() {
  const tws=getTWS();
  polarData.forEach((row,i)=>{
    tws.forEach(w=>{
      if(row[w]==null){
        const above=polarData.slice(0,i).reverse().find(r=>r[w]!=null);
        const below=polarData.slice(i+1).find(r=>r[w]!=null);
        if(above&&below){
          const t=(row.angle-above.angle)/(below.angle-above.angle);
          row[w]=above[w] + (below[w]-above[w])*t;
        }
      }
    });
  });
  renderTable(); plotPolar();
}

function exportData() {
  const blob=new Blob([JSON.stringify(polarData,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download='polar_data.json'; a.click();
}

document.getElementById('importFile').onchange = e=>{
  const f=e.target.files[0]; if(!f) return;
  const reader=new FileReader();
  reader.onload = ()=>{
    try {
      const data = JSON.parse(reader.result);
      if(Array.isArray(data)){ polarData=data; renderTable(); plotPolar(); }
    } catch{}
  };
  reader.readAsText(f);
};

document.addEventListener('DOMContentLoaded',()=>{
  renderTable(); plotPolar();
  document.getElementById('btnPolar').onclick=plotPolar;
  document.getElementById('btnVMG').onclick=plotVMG;
  document.getElementById('btnInterp').onclick=interpolateEmpty;
  document.getElementById('btnExport').onclick=exportData;
});
