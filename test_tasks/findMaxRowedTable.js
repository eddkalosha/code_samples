function solution(html) { 
    const domParser = new DOMParser(); 
    const rootNode = domParser.parseFromString(html,"text/html") 
    const tables = rootNode.querySelectorAll('table'); 
    if (tables.length===0) return 0;
    return Array.from(tables).reduce((accum,table)=>{
            const tdCounter = table.querySelectorAll('td').length;
            return tdCounter>accum ? tdCounter:accum;
        },0);
}
