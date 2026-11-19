# Odor Lab

**[Open Odor Lab](https://mohammadsadaf.github.io/odor-lab-web/)**

Odor Lab is an interactive web app that predicts how a chemical molecule might smell. You give it a molecular structure, and it returns possible odor descriptions such as fruity, floral, sweet, smoky, or minty.

The project explores a question: **can a computer learn the connection between a molecule’s structure and its smell?** Odor Lab uses a machine-learning model trained on molecules with recorded odor descriptions to find those patterns.

## Getting started

To describe a molecule, the app accepts a **SMILES string**. This is a short text representation of a chemical structure. For example, `CCO` represents ethanol. You can also start by clicking a familiar example, such as vanillin or limonene, so you don’t need to know chemical notation to explore the app.

## What you can do

Once you select a molecule, Odor Lab lets you:

- **View its structure:** see a diagram showing how its atoms are connected.
- **Explore predicted smells:** view its highest-scoring descriptions from a vocabulary of 138 odor words.
- **Check basic properties:** see information such as molecular weight and the number of atoms and bonds.
- **Compare similar molecules:** explore structures that resemble your input and read their recorded odor labels.
- **Search the collection:** look for molecules associated with words such as “smoky” or “fruity.”
- **Download results:** save the prediction scores in a JSON file for later use.

For example, selecting **vanillin** produces strong associations with **vanilla, sweet, and creamy**. Selecting **limonene** changes the results, with **herbal, citrus, and spicy** among its strongest predicted notes. This makes the app useful for exploring how changes in molecular structure relate to changes in smell.

## How it works

Behind the scenes, the app turns each structure into a numerical pattern called a **molecular fingerprint**. The trained model reads that pattern and calculates a score for each odor description. A molecule can receive several descriptions because one smell can have multiple qualities.

The model was trained on **3,871 molecules**, checked against a separate validation set, and finally evaluated on **485 molecules that were not used for training**. It achieved a **ROC-AUC score of 0.841**. This measures how well it ranks odor associations; it does not mean that every prediction is 84.1% accurate.

Odor Lab runs directly in the visitor’s browser. After the chemistry tools and model finish loading, predictions happen on the visitor’s device. No account or software installation is needed. The first load downloads approximately 11 MB of chemistry tools and model files.

## What to keep in mind

The app is an educational and experimental tool. It handles individual molecules, while complete perfumes, foods, and other mixtures involve additional complexity. Its scores describe possible odor qualities; smell strength, concentration, and differences between people fall outside what the model measures.

## Run locally

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

Scores are uncalibrated label probabilities, not odor intensity. Molecules in the training set are marked in the interface. Random molecular splitting permits related structures across splits. The published metrics describe this project's fingerprint baseline; the OpenPOM graph neural network and BME688 sensor classifier are different models.

## Attribution

Chemistry runtime: [RDKit.js](https://www.rdkitjs.com/), distributed under the BSD 3-Clause license retained in vendor/RDKIT_LICENSE.txt. The runtime is bundled locally; Google Fonts is loaded with local font fallbacks.

Dataset: [BioMachineLearning/OpenPOM](https://github.com/BioMachineLearning/openpom/blob/main/openpom/data/curated_datasets/curated_GS_LF_merged_4983.csv). Upstream MIT license retained in data/OPENPOM_LICENSE. Catalog labels can be noisy. Research background: [A principal odor map unifies diverse tasks in olfactory perception](https://pmc.ncbi.nlm.nih.gov/articles/PMC11898014/).
