//extension for widget <MultiProductCharge>
window.localStorage.setItem('MultiProductCharge_mode','insert');
var searchParams = new URLSearchParams(window.location.search);
searchParams.set('widget','MultiProductCharge');
searchParams.delete('mode');
var newParams = '?'+ searchParams.toString();
window.location.replace(window.location.origin + window.location.pathname + newParams);

________________________________________________________________________________________________

//extension for widget <MultiProductCharge>
window.localStorage.setItem('MultiProductCharge_mode','update');
var searchParams = new URLSearchParams(window.location.search);
searchParams.set('widget','MultiProductCharge');
searchParams.delete('mode');
var newParams = '?'+ searchParams.toString();
window.location.replace(window.location.origin + window.location.pathname + newParams);
