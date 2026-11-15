/* Decode the repository's embedded JSON without executing the storefront or using recursive regex. */
window.vraxisReadTemplateSource=source=>{
 const declaration=source.indexOf('const TEMPLATE');if(declaration<0)throw Error('Design unavailable');
 let start=source.indexOf('=',declaration)+1;if(start<1)throw Error('Design unavailable');
 while(start<source.length&&/\s/.test(source[start]))start++;
 if(source[start]!=='"')throw Error('Design unavailable');
 let end=start+1;for(;end<source.length;end++){if(source[end]==='\\'){end++;continue;}if(source[end]==='"')break;}
 if(end>=source.length)throw Error('Design unavailable');
 const value=JSON.parse(source.slice(start,end+1));if(!/^\s*<!doctype html/i.test(value))throw Error('Design unavailable');return value;
};
