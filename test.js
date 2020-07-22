let r = /\|\|\[.*?\]\|\|/g
console.log('||[sd]||||[dad]||'.replace(r,'').length);
console.log('||[sd]||323||[dad]||'.replace(r,'').length);
console.log('12||[sd]||dd||[dad]||dd'.replace(r,'').length);