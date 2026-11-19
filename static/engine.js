/* The same fitted Morgan-fingerprint baseline, evaluated in JavaScript. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OdorEngine = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  class OdorEngine {
    constructor(rdkit, data, weights) {
      this.rdkit = rdkit;
      this.data = data;
      this.weights = weights;
      if (weights.length !== data.tasks.length * data.fingerprint_size) throw new Error('Incomplete model download. Please reload.');
      this.bySmiles = new Map(data.rows.map(row => [row.smiles, row]));
    }
    fingerprint(mol) {
      const raw = mol.get_morgan_fp(JSON.stringify({radius: 2, nBits: 2048, useChirality: false}));
      if (raw.length !== 2048) throw new Error('Unsupported molecular fingerprint.');
      const bits = [];
      for (let i = 0; i < raw.length; i++) if (raw[i] === '1') bits.push(i);
      return bits;
    }
    scores(bits) {
      return this.data.tasks.map((label, index) => {
        let value = this.data.intercepts[index];
        const offset = index * this.data.fingerprint_size;
        for (const bit of bits) value += this.weights[offset + bit];
        return {label, score: 1 / (1 + Math.exp(-value))};
      });
    }
    predict(smiles) {
      if (typeof smiles !== 'string' || !smiles.trim() || smiles.trim().length > 500) throw new Error('Enter a SMILES string between 1 and 500 characters.');
      let mol;
      try { mol = this.rdkit.get_mol(smiles.trim()); } catch (_) { /* handled below */ }
      if (!mol || !mol.is_valid() || mol.get_num_atoms() === 0) {
        if (mol) mol.delete();
        throw new Error('That SMILES could not be parsed. Try CCO for ethanol.');
      }
      try {
        const canonical = mol.get_smiles();
        if (canonical.includes('.')) throw new Error('Use one connected molecule. Mixtures and disconnected salts are not supported.');
        const desc = JSON.parse(mol.get_descriptors());
        if (desc.NumHeavyAtoms > 150) throw new Error('This model supports molecules with at most 150 heavy atoms.');
        const bits = this.fingerprint(mol);
        const neighbors = this.data.rows.map((row, index) => {
          let i = 0, j = 0, overlap = 0;
          while (i < bits.length && j < row.bits.length) {
            if (bits[i] === row.bits[j]) { overlap++; i++; j++; }
            else if (bits[i] < row.bits[j]) i++;
            else j++;
          }
          const union = bits.length + row.bits.length - overlap;
          return {index, similarity: union ? overlap / union : 0};
        }).sort((a,b) => b.similarity - a.similarity || a.index - b.index).slice(0,4).map(n => {
          const row = this.data.rows[n.index];
          return {smiles: row.smiles, similarity: Number(n.similarity.toFixed(3)), labels: row.labels, split: row.split};
        });
        return {
          smiles: canonical, atoms: desc.NumHeavyAtoms, bonds: mol.get_num_bonds(),
          weight: Number(desc.amw.toFixed(2)), logp: Number(desc.CrippenClogP.toFixed(2)),
          svg: mol.get_svg(540,300), neighbors,
          predictions: this.scores(bits).sort((a,b) => b.score - a.score).map(p => ({label:p.label,score:Number(p.score.toFixed(5))})),
          dataset_split: this.bySmiles.get(canonical)?.split || null,
          model: 'Fingerprint baseline', runtime: 'RDKit WebAssembly + JavaScript, entirely in your browser',
          note: 'Model scores are uncalibrated label probabilities, not odor intensity. Single molecules only.'
        };
      } finally { mol.delete(); }
    }
    library(query='') {
      query = String(query).trim().toLowerCase().slice(0,100);
      return {molecules:this.data.rows.filter(r => !query || r.smiles.toLowerCase().includes(query) || r.labels.some(t => t.includes(query))).slice(0,60).map(({smiles,labels,split})=>({smiles,labels,split}))};
    }
    status() { return {ready:true,metrics:this.data.metrics,examples:this.data.examples}; }
  }
  return OdorEngine;
});
