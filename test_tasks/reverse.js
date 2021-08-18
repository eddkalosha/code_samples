const invert = str => { 
    if (str===null || str===undefined) return '';
    const fStr = String(str);
    if (fStr.length===1) return fStr;
    return [...fStr].reverse().join('');
}
