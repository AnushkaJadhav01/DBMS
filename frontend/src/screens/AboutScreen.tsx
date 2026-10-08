import React from 'react';
import { FileText, Award, Layers, Server, Code, CheckCircle, Database } from 'lucide-react';

export default function AboutScreen() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-2">
          <FileText size={14} /> Documentation & Viva Guide
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">System Architecture & ML Viva Reference</h1>
        <p className="text-xs text-slate-400 mt-1">Complete technical breakdown of the ColdChain OSMS Machine Learning Prediction Product.</p>
      </div>

      {/* Problem Statement & Audience */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="text-blue-400" size={20} /> Problem Statement & Target Audience
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-300">
          <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white mb-2 text-sm">Real-World Problem</h4>
            <p>
              Predicting shipped order quantity (demand) for cold-chain temperature-sensitive products (vaccines, biologics, blood products). Eliminates over-stocking spoilage and critical hospital supply outages.
            </p>
          </div>
          <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white mb-2 text-sm">Target End-Users</h4>
            <p>
              Hospital procurement directors, cold-chain logistics dispatchers, pharmaceutical distributors, and platform administrators.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture & Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="text-indigo-400" size={20} /> Machine Learning Core Pipeline
        </h2>

        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <p className="text-blue-400 font-bold">DBMS SQLite/MySQL Historical Orders</p>
          <p className="pl-4">└── SQL Join across shipment, orders, and product tables (200 transactions)</p>
          <p className="text-indigo-400 font-bold mt-2">Data Cleaning & Feature Engineering</p>
          <p className="pl-4">├── Median Imputation + Categorical OneHotEncoding</p>
          <p className="pl-4">├── Chronological Historical Mean Demand (Zero Data Leakage)</p>
          <p className="pl-4">└── Standard Scaling (Mean=0, Variance=1)</p>
          <p className="text-emerald-400 font-bold mt-2">Multi-Algorithm Hyperparameter Tuning (5-Fold CV)</p>
          <p className="pl-4">├── 1. Ridge Regression (L2 Linear)</p>
          <p className="pl-4">├── 2. Random Forest Regressor</p>
          <p className="pl-4">├── 3. Gradient Boosting Regressor (GBR)</p>
          <p className="pl-4">└── 4. K-Nearest Neighbors Regressor (KNN) — Selected Best (R² = 0.9745)</p>
          <p className="text-cyan-400 font-bold mt-2">Flask REST API Serving & Confidence Bounds</p>
          <p className="pl-4">└── Calculates Prediction ± MAE Confidence Interval & Feature Importances</p>
        </div>
      </div>

      {/* Viva Justification Q&A */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Code className="text-emerald-400" size={20} /> Key Viva Questions & Answers
        </h2>

        <div className="space-y-4 text-xs leading-relaxed">
          <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white mb-1">Q: Why choose Regression over Classification for this dataset?</h4>
            <p className="text-slate-400">A: Shipped demand quantity is a continuous numerical variable (ranging from 18 to 435 units). Regression allows exact numerical forecasting and confidence interval calculation [Prediction - MAE, Prediction + MAE].</p>
          </div>
          <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white mb-1">Q: How do you prevent data leakage during feature engineering?</h4>
            <p className="text-slate-400">A: Historical mean demand per product is computed chronologically strictly using orders occurring prior to the current transaction date. Target shipment quantities are excluded from feature inputs.</p>
          </div>
          <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white mb-1">Q: How was the final algorithm selected?</h4>
            <p className="text-slate-400">A: Four candidate models were evaluated with 5-fold cross-validation and hyperparameter grid search. KNN Regressor achieved the highest R² score (0.9745) and lowest MAE (12.34 units) on held-out test data.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
