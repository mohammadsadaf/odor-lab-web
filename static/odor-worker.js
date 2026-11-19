/* Chemistry and prediction run off the main thread. Inputs never leave the browser. */
importScripts('../vendor/RDKit_minimal.js', './engine.js');
async function fetchAsset(path, type) {
  const response = await fetch(new URL(path, self.location.href));
  if (!response.ok) throw new Error('Could not download the model. Please check your connection and reload.');
  return type === 'binary' ? response.arrayBuffer() : response.json();
}
const ready = Promise.all([
  initRDKitModule({locateFile:name=>new URL('../vendor/'+name,self.location.href).href}),
  fetchAsset('../data/model.json'), fetchAsset('../data/weights.bin','binary')
]).then(([rdkit,data,buffer]) => new OdorEngine(rdkit,data,new Float64Array(buffer)));
// Keep initial failures observable by every request, without an unhandled rejection.
ready.catch(()=>{});
self.onmessage = async event => {
  const {id,url,options} = event.data;
  try {
    const engine = await ready;
    let result;
    if (url === '/api/status') result = engine.status();
    else if (url === '/api/predict') result = engine.predict(JSON.parse(options.body).smiles);
    else if (url.startsWith('/api/library')) result = engine.library(new URL(url,'https://odor.invalid').searchParams.get('q')||'');
    else throw new Error('Unknown request.');
    self.postMessage({id,result});
  } catch (error) { self.postMessage({id,error:error.message||'The molecule could not be processed.'}); }
};
