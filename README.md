# Odor Lab — browser edition

An interactive molecular odor explorer. RDKit WebAssembly builds radius-2, 2,048-bit Morgan fingerprints; JavaScript evaluates the same 138 fitted logistic regression classifiers as the Python Odor Lab project.

## Use

Open the hosted website in a current browser, select a molecule or enter a connected molecular SMILES, and explore predicted odor notes. First load downloads the chemistry runtime and fitted model (approximately 11 MB). Predictions run in a Web Worker. Molecular inputs are processed on the visitor's device and are not submitted to a prediction server.

For local use, serve this directory over HTTP:

```bash
python3 -m http.server 5051
```

Then open http://127.0.0.1:5051/. A file:// URL does not support the worker/runtime loading flow.

## Hosting

This directory is a complete static site. On GitHub Pages, select the main branch and the root folder as the publishing source. The included .nojekyll file bypasses Jekyll processing. All asset URLs are relative, supporting project URLs under a subdirectory.

## Model and verification

- Training data: OpenPOM's curated 4,983-row molecular dataset; 4,843 usable connected molecules after filtering.
- Split: 3,871 train / 487 validation / 485 test.
- Held-out macro ROC-AUC: 0.8407 across 138 odor labels.
- Browser export checked against Python on every usable molecule: 668,334 label scores, maximum absolute difference below 8e-16. Fingerprint bits matched for all 4,843 molecules.
- RDKit browser and Python versions: 2026.09.2.
- Fitted coefficients are Float64 little-endian in data/weights.bin; task order, intercepts, dataset labels and fingerprints, and measured metrics are in data/model.json.

Scores are uncalibrated label probabilities, not odor intensity. Molecules in the training set are marked in the interface. Random molecular splitting permits related structures across splits. This baseline is separate from the OpenPOM graph neural network. OpenPOM GPU training and BME688 sensor collection/training remain separate workflows in the Python project.

## Attribution

Chemistry runtime: [RDKit.js](https://www.rdkitjs.com/), distributed under the BSD 3-Clause license retained in vendor/RDKIT_LICENSE.txt. The runtime is bundled locally; Google Fonts is loaded with local font fallbacks.

Dataset: [BioMachineLearning/OpenPOM](https://github.com/BioMachineLearning/openpom/blob/main/openpom/data/curated_datasets/curated_GS_LF_merged_4983.csv). Upstream MIT license retained in data/OPENPOM_LICENSE. Catalog labels can be noisy. Research background: [A principal odor map unifies diverse tasks in olfactory perception](https://pmc.ncbi.nlm.nih.gov/articles/PMC11898014/).
